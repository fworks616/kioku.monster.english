#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export WRANGLER_LOG_PATH="$PWD/.wrangler/logs"
export WRANGLER_SEND_METRICS=false
if [[ ! -x node_modules/.bin/wrangler ]]; then
  npm ci
fi
wrangler() { ./node_modules/.bin/wrangler "$@"; }
if ! wrangler whoami; then
  printf '\nCloudflareへのログインを開始します。ブラウザで認証してください。\n'
  wrangler login
fi
npm test
# Keep an existing database binding; otherwise reuse the named DB or create it.
needs_database=$(node --input-type=module -e '
import fs from "node:fs";
const config=JSON.parse(fs.readFileSync("wrangler.jsonc","utf8"));
const id=config.d1_databases.find(d=>d.binding==="DB")?.database_id;
console.log(!id || id==="00000000-0000-0000-0000-000000000000" ? "yes" : "no");
')
if [[ "$needs_database" == yes ]]; then
  mkdir -p .wrangler
  database_list=$(mktemp "$PWD/.wrangler/databases.XXXXXX")
  trap 'rm -f "$database_list"' EXIT
  wrangler d1 list --json > "$database_list"
  database_id=$(node --input-type=module -e '
import fs from "node:fs";
const dbs=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
console.log(dbs.find(d=>d.name==="kioku-english")?.uuid || "");
' "$database_list")
  if [[ -z "$database_id" ]]; then
    wrangler d1 create kioku-english --no-update-config
    wrangler d1 list --json > "$database_list"
    database_id=$(node --input-type=module -e '
import fs from "node:fs";
const dbs=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
const db=dbs.find(d=>d.name==="kioku-english");
if (!db?.uuid) throw Error("D1のIDを取得できませんでした");
console.log(db.uuid);
' "$database_list")
  fi
  node --input-type=module - "$database_id" <<'JS'
import fs from 'node:fs';
const file='wrangler.jsonc';
const config=JSON.parse(fs.readFileSync(file,'utf8'));
config.d1_databases.find(d=>d.binding==='DB').database_id=process.argv[2];
fs.writeFileSync(file,JSON.stringify(config,null,2)+'\n');
JS
fi
wrangler d1 migrations apply DB --remote
wrangler deploy
