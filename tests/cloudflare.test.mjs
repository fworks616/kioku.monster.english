import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import worker from '../cloudflare/worker.mjs';

// Exercise the actual migration and SQL against SQLite through the D1 interface.
function d1(sqlite) {
  return {
    prepare(sql) {
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        async first() { return sqlite.prepare(sql).get(...values) || null; },
        async run() { const r = sqlite.prepare(sql).run(...values); return {meta: {changes: Number(r.changes)}}; }
      };
    },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try { const results = []; for (const statement of statements) results.push(await statement.run()); sqlite.exec('COMMIT'); return results; }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    }
  };
}
test('Cloudflare API: durable accounts, isolation, session revocation and validation', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'kioku-d1-'));
  let sqlite = new DatabaseSync(path.join(dir, 'test.sqlite'));
  sqlite.exec(await readFile(new URL('../migrations/0001_initial.sql', import.meta.url), 'utf8'));
  let env = {DB: d1(sqlite), ASSETS: {fetch: async () => new Response('asset')}};
  const request = (route, method = 'GET', data, cookie, origin = 'https://kioku.example', ip = '192.0.2.1') => worker.fetch(new Request('https://kioku.example' + route, {
    method, headers: {'CF-Connecting-IP': ip, ...(origin ? {Origin: origin} : {}), ...(data !== undefined ? {'Content-Type': 'application/json'} : {}), ...(cookie ? {Cookie: cookie} : {})},
    ...(data !== undefined ? {body: JSON.stringify(data)} : {})
  }), env);
  try {
    assert.equal(await (await request('/')).text(), 'asset');
    assert.equal((await request('/api/data')).status, 401);
    const user = {email: 'learn@example.com', password: 'test-password-123', name: 'Learner'};
    const signup = await request('/api/signup', 'POST', user);
    assert.equal(signup.status, 200);
    assert.equal((await signup.json()).user.name, 'Learner');
    const header = signup.headers.get('Set-Cookie'), cookie = header.split(';')[0];
    for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict']) assert.ok(header.includes(flag));
    assert.equal((await request('/api/signup', 'POST', user)).status, 409);
    assert.equal((await request('/api/signin', 'POST', {...user, password: 'wrong-password'})).status, 401);
    const state = {records: {p0: {level: 2, due: Date.now()}}, days: {'2026-10-23': 1}, bookmarks: ['p0'], goal: 20};
    assert.equal((await request('/api/data', 'PUT', state, cookie)).status, 200);
    const other = await request('/api/signup', 'POST', {...user, email: 'other@example.com'});
    const otherCookie = other.headers.get('Set-Cookie').split(';')[0];
    assert.deepEqual((await (await request('/api/data', 'GET', undefined, otherCookie)).json()).data.records, {});
    assert.equal((await request('/api/data', 'PUT', state, cookie, 'https://evil.example')).status, 403);
    assert.equal((await request('/api/data', 'PUT', state, cookie, null)).status, 403);
    assert.equal((await request('/api/data', 'PUT', {...state, goal: -1}, cookie)).status, 400);
    assert.equal((await request('/api/data', 'PUT', {large: 'x'.repeat(250001)}, cookie)).status, 413);
    const malformed = await worker.fetch(new Request('https://kioku.example/api/signup', {method: 'POST', headers: {Origin: 'https://kioku.example', 'Content-Type': 'application/json'}, body: '{'}), env);
    assert.equal(malformed.status, 400);
    // Reopen storage and recreate bindings as on a fresh Worker instance.
    sqlite.close();
    sqlite = new DatabaseSync(path.join(dir, 'test.sqlite'));
    env = {...env, DB: d1(sqlite)};
    assert.deepEqual((await (await request('/api/data', 'GET', undefined, cookie)).json()).data, state);
    assert.equal((await request('/api/signin', 'POST', user)).status, 200);
    assert.equal((await request('/api/signout', 'POST', {}, cookie)).status, 200);
    assert.equal((await request('/api/data', 'GET', undefined, cookie)).status, 401);
    sqlite.prepare('UPDATE sessions SET expires = 0').run();
    assert.equal((await request('/api/data', 'GET', undefined, otherCookie)).status, 401);
    for (let i = 0; i < 15; i++) assert.equal((await request('/api/signin', 'POST', {}, undefined, 'https://kioku.example', '192.0.2.2')).status, 400);
    assert.equal((await request('/api/signin', 'POST', {}, undefined, 'https://kioku.example', '192.0.2.2')).status, 429);
    sqlite.prepare('UPDATE attempts SET until = 0').run();
    assert.equal((await request('/api/signin', 'POST', {}, undefined, 'https://kioku.example', '192.0.2.2')).status, 400);
    const row = sqlite.prepare('SELECT password FROM users WHERE email = ?').get(user.email);
    assert.notEqual(row.password, user.password);
  } finally { sqlite.close(); await rm(dir, {recursive: true, force: true}); }
});
