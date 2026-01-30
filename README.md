# 🥊 BLAZE KICKBOXING GYM

キックボクシングパーソナルジム向けの会員管理システム

## ✨ 機能

- **入会・会員登録** - オンラインでの新規会員登録
- **予約管理＆振替** - トレーニングセッションの予約と振替
- **会員管理** - プラン、残りセッション数、ステータス管理
- **デジタル会員証（QR）** - スマホで表示できるQR会員証
- **QR入退館（チェックイン）** - QRコードでの入退館管理
- **オンライン物販** - グローブ、アパレルなどの販売
- **イベント管理** - セミナー、大会、ワークショップの管理
- **管理画面** - オーナー・トレーナー用ダッシュボード

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: SQLite (Prisma ORM)
- **認証**: NextAuth.js
- **アニメーション**: Framer Motion
- **QRコード**: qrcode.react

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` ファイルを作成：

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
GYM_NAME="BLAZE KICKBOXING GYM"
```

### 3. データベースのセットアップ

```bash
# データベースを作成
npx prisma db push

# シードデータを投入
npm run db:seed
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## 📋 テストアカウント

シードデータ投入後、以下のアカウントでログインできます：

| 役割 | メールアドレス | パスワード |
|------|---------------|-----------|
| 管理者 | admin@blaze-gym.jp | admin123 |
| トレーナー | yamada@blaze-gym.jp | trainer123 |
| 会員 | demo@example.com | member123 |

## 📁 プロジェクト構成

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/             # 管理画面
│   ├── dashboard/         # 会員ダッシュボード
│   ├── login/             # ログインページ
│   └── register/          # 会員登録ページ
├── components/            # Reactコンポーネント
│   ├── layout/           # レイアウトコンポーネント
│   └── ui/               # UIコンポーネント
├── lib/                   # ユーティリティ関数
├── prisma/               # データベーススキーマ
└── types/                # TypeScript型定義
```

## 🔧 利用可能なスクリプト

- `npm run dev` - 開発サーバーの起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバーの起動
- `npm run db:push` - データベーススキーマの適用
- `npm run db:seed` - シードデータの投入
- `npm run db:studio` - Prisma Studioの起動

## 📱 主要画面

### 会員向け
- ダッシュボード - 会員情報、予約、チェックイン履歴
- 予約 - トレーニングセッションの予約
- 会員証 - QRコード付きデジタル会員証
- ショップ - グッズの購入
- イベント - イベントへの参加登録

### 管理者向け
- ダッシュボード - 統計情報、クイックアクション
- 会員管理 - 会員一覧、詳細編集
- 予約管理 - 予約の確認、管理
- チェックイン - QRスキャンによる入退館管理
- 商品管理 - 物販商品の管理
- イベント管理 - イベントの作成、編集

## 📄 ライセンス

MIT License
