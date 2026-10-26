# WORD SPIN — 英単語ルーレット

スマホの片手操作に対応した、日常英単語30語・英検準1級対策40語の学習アプリ。8ジャンルのルーレットを回し、毎回5問の短いチャレンジで語彙を増やします。

## 起動

Node.js 22.16以降（推奨24 LTS）で `npm start`。http://localhost:3000 にアクセス。
Nodeサーバーの実行だけなら追加パッケージは不要です。Cloudflare開発・デプロイとテストには `npm ci` を実行してください。
同じWi-FiのスマホからはPCのLAN IPアドレスの3000番ポートにアクセスできます。
`PORT` 環境変数でポートを変更できます。

## 機能

- 8ジャンルからルーレットで出題テーマを決定。1回5問の四択チャレンジ。
- 正解後に、意味・発音記号・独自の例文と和訳を確認。
- 全70語＋例文70本を、米国英語 `en-US-AriaNeural` の生成済みMP3で再生。単語は標準速度、例文は5%ゆっくり。再生時に「ふつう／ゆっくり」を選べ、声の高さを維持します。
- 音声ファイルが利用できない場合だけ、英語を明示した端末音声へ切り替えます。
- 1語学習するごとに10 XP、50語ごとにレベルアップ。実際の学習記録からミッションと4種類のバッジを表示。
- 「もう一度」は10分後、「覚えた」は1・3・7・14・30・60日後に復習。
- 学習日数、1日の目標、7日間の履歴、単語帳ごとの習得状況。
- 単語検索、保存、苦手・習得済みの絞り込み。
- メール・パスワードの新規登録、ログイン、ログアウト。
- ログイン時の記録はアカウントごとにサーバーへ保存。同じサーバーにログインすると端末間でも同じ記録を使用できます。
- ゲストの記録はブラウザのlocalStorageに保存。ログイン記録とは別です。
- 学習記録のJSON書き出し。

## データと認証

パスワードは個別のsaltを付けたscryptハッシュで保存します。セッションは7日間で、HttpOnly・SameSite=StrictのCookieを使用。サーバー再起動後は再ログインが必要です。POST/PUTでは同一オリジンを検証し、ログイン試行を制限しています。

アカウントと学習記録は `.data/accounts.json` に保存します。このフォルダはGit管理対象外です。バックアップしてください。`KIOKU_DATA_DIR` で保存先を変更できます。

メールアドレスの確認・パスワード再設定は未対応。Cloudflare版は以下のWorkers＋D1構成でアカウントと学習記録を保存します。

## Cloudflare Workersへデプロイ

一括実行は `bash scripts/deploy-cloudflare.sh`。既存のWrangler認証を確認し、必要ならブラウザ認証を開始します。テスト後、D1の作成または再利用、DB IDの反映、マイグレーション、公開を順に実行します。GitHub・MCPは不要です。

静的ファイル（音声を含む）はWorkers Static Assets、`/api/*` は `cloudflare/worker.mjs`、永続保存はD1を使用します。Nodeサーバーや永続ディスクは不要です。

```sh
npm ci
npx wrangler login
npx wrangler d1 create kioku-english
```

作成結果の `database_id` を `wrangler.jsonc` のゼロで埋めた仮IDと置き換えてください。`binding` は `DB` のままにします。

```sh
npm run db:migrate:remote
npm run deploy
```

デプロイ結果に表示されるHTTPSの `workers.dev` URLで利用できます。CloudflareのGit連携ではビルドコマンドを `npm ci`、デプロイコマンドを `npm run deploy` にします。D1の作成と本番マイグレーションは先に実行してください。独自ドメインはWorkersの管理画面から設定できます。

ローカルでCloudflare版を確認する場合:

```sh
npm run db:migrate:local
npm run dev:cloudflare
```

`http://localhost:8787` で利用します。ローカルD1は `.wrangler/` に保存され、本番DBとは別です。デプロイ前のバンドル確認は `npx wrangler deploy --dry-run`、テストは `npm test` です。

Cloudflare版のパスワードは個別salt＋PBKDF2-SHA256（100,000回）で保存します。セッションはハッシュ化してD1に保存し、有効期限は7日間。デプロイ後もログインを保持し、ログアウト時に無効化します。HTTPSではSecure Cookieを付けます。同一オリジン検証、250KBの入力上限、D1で共有するIP単位の認証試行制限も実装しています。

**既存データについて:** Node版の `.data/accounts.json` とCloudflareのD1は別保存先です。既存アカウント・記録は自動移行されません。Node版とハッシュ形式も異なるため、既存利用者がいる場合は移行対応が必要です。ゲストの記録はブラウザのオリジンごとなので、URLを変更する前にJSON書き出しでバックアップしてください（JSON取り込みは未対応）。

構成の参考: [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)、[D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)。

## 検証

Cloudflare版は実際のSQLマイグレーションをSQLiteへ適用し、Workers APIの認証・保存・ユーザー分離・セッション失効・CSRF・入力上限・試行制限・DB再接続後の永続化を検証します。Cloudflare実行環境での確認は `npm run dev:cloudflare` で行ってください。

`npm test` で語彙・復習間隔・出題順序・アカウント登録・ログイン・ログアウト・ユーザー間のデータ分離・再起動後の永続化・CSRF拒否を検証します。
デスクトップChromeで新しいカード画面の表示を確認。スマホ実機の表示確認は未実施です。音声ファイル全140本の存在・形式と、再生速度・同時再生の停止・英語音声フォールバックをテストしています。

## 語彙について

独自選定の学習用語彙と独自作成の例文です。英検の公式出題リストではありません。
英検®は公益財団法人 日本英語検定協会の登録商標です。本アプリは同協会の承認・推奨を受けていません。

## 音声の再生成

通常の利用には追加パッケージも外部TTSへの接続も不要です。全140本のMP3を同梱しています。
開発時に再生成する場合は、Pythonの仮想環境へ `edge-tts` をインストールし、`node scripts/generate-audio.mjs` を実行します。存在するファイルはスキップします。`KIOKU_TTS_BIN` でCLIのパスを指定できます。生成時には語彙と例文のみを音声サービスへ送信し、アカウント情報や学習記録は送信しません。
# kioku.monster.english
