# the-fool

CODE OF JOKERのシミュレーションシステムを提供するWebSocketサーバ

## ドキュメント

開発を始める前に、以下のドキュメントを参照してください：

- **[ドキュメントトップ](./docs/README.md)** - ドキュメント全体の目次
- **[環境構築](./docs/getting-started.md)** - 開発環境のセットアップ
- **[アーキテクチャ](./docs/architecture.md)** - プロジェクト構成の理解
- **[カード効果実装ガイド](./docs/card-effects/implementation-guide.md)** - カード効果の実装方法

---

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## 関係リポジトリ

- [the-magician](https://github.com/sweshelo/the-magician) - WebUI
- [suit](https://github.com/sweshelo/suit) - 共通型定義

## クイックスタート

### インストール

```bash
bun install
```

### 鍵の生成（オプション）

```bash
mkdir certs
openssl genrsa 2048 > certs/key.pem;
mkcert -cert-file certs/cert.pem -key-file ./certs/key.pem localhost [IPアドレス];
```

### サブモジュールのインストール

```bash
git submodule init
git submodule update
```

### .envファイルの用意

```bash
cp .env.sample .env
```

### 実行

```bash
bun dev
```

詳細は [環境構築ドキュメント](./docs/getting-started.md) を参照してください。
