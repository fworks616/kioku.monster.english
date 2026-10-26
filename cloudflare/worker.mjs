const encoder = new TextEncoder();
const hex = bytes => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
const random = size => hex(crypto.getRandomValues(new Uint8Array(size)));
const hash = async value => hex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: 100000}, key, 256));
}
const publicUser = ({id, email, name}) => ({id, email, name});
const tokenFrom = request => (request.headers.get('Cookie') || '').split(';').map(s => s.trim()).find(s => s.startsWith('kioku_session='))?.slice(14);
const cookie = (request, token, age) => `kioku_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
const json = (status, value, headers = {}) => Response.json(value, {status, headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', 'X-Frame-Options': 'SAMEORIGIN', ...headers}});
export function validateState(s) {
  return !!(s && typeof s === 'object' && s.records && typeof s.records === 'object' && !Array.isArray(s.records) && s.days && typeof s.days === 'object' && !Array.isArray(s.days) && Array.isArray(s.bookmarks) && Number.isInteger(s.goal) && s.goal >= 1 && s.goal <= 100 && Object.values(s.records).every(r => r && Number.isInteger(r.level) && r.level >= 0 && r.level <= 6 && Number.isFinite(r.due)) && Object.values(s.days).every(n => Number.isInteger(n) && n >= 0) && s.bookmarks.every(v => typeof v === 'string'));
}
async function body(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request.body || []) {
    size += chunk.byteLength;
    if (size > 250000) throw new Error('too_large');
    chunks.push(chunk);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes) || '{}');
}
async function current(request, db) {
  const token = tokenFrom(request);
  if (!token) return null;
  return db.prepare('SELECT users.* FROM users JOIN sessions ON users.id = sessions.user_id WHERE sessions.token = ? AND sessions.expires > ?').bind(await hash(token), Date.now()).first();
}
async function api(request, env) {
  const p = new URL(request.url).pathname, method = request.method, db = env.DB;
  if (!['GET', 'POST', 'PUT'].includes(method)) return json(405, {error: '許可されていない操作です。'});
  if (method !== 'GET' && (request.headers.get('Origin') !== new URL(request.url).origin || request.headers.get('Content-Type')?.split(';')[0] !== 'application/json')) return json(403, {error: 'ページを再読み込みしてください。'});
  if (p === '/api/me' && method === 'GET') {
    const user = await current(request, db);
    return json(200, {user: user ? publicUser(user) : null});
  }
  if (['/api/signup', '/api/signin'].includes(p) && method === 'POST') {
    const now = Date.now(), ip = await hash(request.headers.get('CF-Connecting-IP') || 'local');
    // The conditional upsert keeps the limit atomic across Worker instances.
    const attempt = await db.prepare('INSERT INTO attempts (ip, count, until) VALUES (?, 1, ?) ON CONFLICT(ip) DO UPDATE SET count = CASE WHEN attempts.until <= ? THEN 1 ELSE attempts.count + 1 END, until = CASE WHEN attempts.until <= ? THEN excluded.until ELSE attempts.until END RETURNING count').bind(ip, now + 900000, now, now).first();
    if (attempt.count > 15) return json(429, {error: '試行回数が多すぎます。15分後にお試しください。'});
    const b = await body(request), email = String(b.email || '').trim().toLowerCase(), password = String(b.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length < 10 || password.length > 128) return json(400, {error: '有効なメールアドレスと10〜128文字のパスワードを入力してください。'});
    let user;
    if (p === '/api/signup') {
      const salt = random(16);
      user = {id: random(16), email, name: String(b.name || '').trim().slice(0, 40) || email.split('@')[0], salt, password: await passwordHash(password, salt), data: JSON.stringify({records: {}, days: {}, bookmarks: [], goal: 10})};
      const result = await db.prepare('INSERT INTO users (id, email, name, salt, password, data) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(email) DO NOTHING').bind(user.id, email, user.name, salt, user.password, user.data).run();
      if (!result.meta.changes) return json(409, {error: 'このメールアドレスは登録済みです。ログインしてください。'});
    } else {
      user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
      const candidate = await passwordHash(password, user?.salt || 'dummy-salt');
      // Compare fixed-length digest bytes without early exit.
      let difference = 0;
      const expected = user?.password || '0'.repeat(64);
      for (let i = 0; i < 64; i++) difference |= candidate.charCodeAt(i) ^ expected.charCodeAt(i);
      if (!user || difference) return json(401, {error: 'メールアドレスまたはパスワードが正しくありません。'});
    }
    const token = random(32);
    await db.batch([
      db.prepare('DELETE FROM attempts WHERE ip = ? OR until <= ?').bind(ip, now),
      db.prepare('DELETE FROM sessions WHERE expires <= ?').bind(now),
      db.prepare('INSERT INTO sessions (token, user_id, expires) VALUES (?, ?, ?)').bind(await hash(token), user.id, now + 604800000)
    ]);
    return json(200, {user: publicUser(user), data: JSON.parse(user.data)}, {'Set-Cookie': cookie(request, token, 604800)});
  }
  if (p === '/api/signout' && method === 'POST') {
    const token = tokenFrom(request);
    if (token) await db.prepare('DELETE FROM sessions WHERE token = ?').bind(await hash(token)).run();
    return json(200, {ok: true}, {'Set-Cookie': cookie(request, '', 0)});
  }
  if (p === '/api/data' && ['GET', 'PUT'].includes(method)) {
    const user = await current(request, db);
    if (!user) return json(401, {error: 'ログインしてください。'});
    if (method === 'GET') return json(200, {data: JSON.parse(user.data)});
    const data = await body(request);
    if (!validateState(data)) return json(400, {error: '学習記録の形式が正しくありません。'});
    await db.prepare('UPDATE users SET data = ? WHERE id = ?').bind(JSON.stringify(data), user.id).run();
    return json(200, {ok: true});
  }
  return json(404, {error: '見つかりません。'});
}
export default {
  async fetch(request, env) {
    if (!new URL(request.url).pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try { return await api(request, env); }
    catch (error) {
      const status = error.message === 'too_large' ? 413 : error instanceof SyntaxError ? 400 : 500;
      if (status === 500) console.error('API failure', error);
      return json(status, {error: status === 413 ? 'データが大きすぎます。' : status === 400 ? '入力を確認してください。' : '保存できませんでした。もう一度お試しください。'});
    }
  }
};
