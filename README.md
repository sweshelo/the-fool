# the-fool

CODE OF JOKERのシミュレーションシステムを提供するWebSocketサーバ

---

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## 環境構築

### インストール

```bash
bun install
```

### 鍵の生成

```bash
mkdir certs
openssl genrsa 2024 > certs/key.pem;
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

## 実行

```bash
bun dev
```
