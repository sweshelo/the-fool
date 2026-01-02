# 環境構築とセットアップ

このガイドでは、The Fool の開発環境を構築し、プロジェクトを実行する方法を説明します。

## 必要な環境

- [Bun](https://bun.sh) v1.2.5 以上
- Git
- (オプション) mkcert - ローカルでの HTTPS 開発用

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd the-fool
```

### 2. サブモジュールのインストール

このプロジェクトは `suit` という共通型定義のサブモジュールを使用しています。

```bash
git submodule update --init --recursive
```

または、依存関係のインストール時に自動的に実行されます（次のステップ）。

### 3. 依存関係のインストール

```bash
bun install
```

このコマンドは以下を実行します：

- npm パッケージのインストール
- サブモジュールの初期化（`preinstall` スクリプト）
- Git フック（lefthook）のセットアップ（`prepare` スクリプト）

### 4. SSL 証明書の生成（オプション）

ローカルで HTTPS 接続を使用する場合は、SSL 証明書を生成します。

```bash
# 証明書ディレクトリの作成
mkdir certs

# 秘密鍵の生成
openssl genrsa 2048 > certs/key.pem

# mkcert を使用した証明書の生成
mkcert -cert-file certs/cert.pem -key-file ./certs/key.pem localhost [IPアドレス]
```

mkcert がインストールされていない場合：

```bash
# macOS
brew install mkcert

# Windows (Chocolatey)
choco install mkcert

# Linux
# https://github.com/FiloSottile/mkcert を参照
```

### 5. 環境変数の設定

`.env.sample` をコピーして `.env` ファイルを作成します。

```bash
cp .env.sample .env
```

必要に応じて `.env` ファイルの設定を編集してください。

## 開発サーバーの起動

```bash
bun dev
```

このコマンドは Bun のホットリロード機能を有効にして `index.ts` を実行します。
コードの変更が自動的に検出され、サーバーが再起動されます。

## ビルドとテスト

### ビルド

現在のところ、ビルドに特殊な設定は不要です。TypeScript は Bun によって直接実行されます。

型チェックを実行する場合：

```bash
bun run tsc --noEmit
```

### テスト

現在のところ、テストコードはありません。今後追加される予定です。

## コーディング規約とリンター

このプロジェクトでは以下のツールを使用してコードの品質を保っています：

- **oxlint** - 高速な TypeScript リンター
- **oxfmt** - コードフォーマッター
- **lefthook** - Git フック管理

これらは Git コミット時に自動的に実行されます。手動で実行する場合：

```bash
# リンターの実行
oxlint

# フォーマッターの実行
oxfmt
```

## プロジェクト構造

```
the-fool/
├── src/
│   ├── package/
│   │   ├── core/        # ゲームコアロジック
│   │   └── server/      # WebSocket サーバー
│   ├── database/
│   │   ├── effects/     # カード効果実装
│   │   └── catalog.ts   # カードカタログ
│   ├── submodule/
│   │   └── suit/        # 共通型定義（サブモジュール）
│   └── config.ts        # 設定ファイル
├── docs/                # ドキュメント
├── certs/               # SSL証明書（手動作成）
└── index.ts             # エントリーポイント
```

詳細は [アーキテクチャドキュメント](./architecture.md) を参照してください。

## 次のステップ

- [アーキテクチャ](./architecture.md) - プロジェクトの全体構造を理解する
- [カード効果実装ガイド](./card-effects/implementation-guide.md) - カード効果の実装方法を学ぶ

## トラブルシューティング

### サブモジュールが正しくインストールされない

```bash
# サブモジュールを強制的に更新
git submodule update --init --recursive --force
```

### Bun がインストールされていない

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"
```

### lefthook が動作しない

```bash
# lefthook を再インストール
bunx lefthook install
```

## 関連リポジトリ

開発を進める際には、以下の関連リポジトリも参照してください：

- [the-magician](https://github.com/sweshelo/the-magician) - Web UI クライアント
- [suit](https://github.com/sweshelo/suit) - 共通型定義（サブモジュール）

## 質問とサポート

問題が発生した場合は、GitHub Issues で報告してください。
