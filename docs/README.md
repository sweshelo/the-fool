# The Fool - ドキュメント

CODE OF JOKER のシミュレータを WebSocket サーバの形で提供するプロジェクトへようこそ。

## 目次

### 開発を始める

- [環境構築とセットアップ](./getting-started.md) - 開発環境の構築とプロジェクトの実行方法

### アーキテクチャ

- [プロジェクト構成](./architecture.md) - プロジェクトの全体構造とディレクトリ構成

### カード効果の実装

- [カード効果実装ガイド](./card-effects/implementation-guide.md) - カード効果を実装するためのガイド
- [API リファレンス](./card-effects/api-reference.md) - Effect、EffectHelper、System などの API ドキュメント
- [実装例](./card-effects/examples.md) - よくあるカード効果の実装例

## プロジェクト概要

このリポジトリは CODE OF JOKER のシミュレータを WebSocket サーバの形で提供します。

### 主要な構成要素

- **コアシステム** (`src/package/core`) - ゲームロジックとルール実装
- **データベース** (`src/database`) - カードデータと効果実装
- **サーバー** (`src/package/server`) - WebSocket サーバーとルーム管理

### 関連リポジトリ

- [the-magician](https://github.com/sweshelo/the-magician) - Web UI クライアント
- [suit](https://github.com/sweshelo/suit) - 共通型定義

## 技術スタック

- **ランタイム**: Bun
- **言語**: TypeScript
- **リンター/フォーマッター**: oxlint, oxfmt
- **Git フック**: lefthook

## クイックスタート

```bash
# 依存関係のインストール
bun install

# サブモジュールの初期化
git submodule update --init --recursive

# 開発サーバーの起動
bun dev
```

詳細は[環境構築とセットアップ](./getting-started.md)を参照してください。

## AIエージェント・新規開発者向けガイド

このプロジェクトに貢献する際は、以下の順序でドキュメントを読むことをお勧めします：

1. **[環境構築](./getting-started.md)** - 開発環境のセットアップ
2. **[アーキテクチャ](./architecture.md)** - プロジェクト全体の構造理解
3. **[カード効果実装ガイド](./card-effects/implementation-guide.md)** - 実際の開発作業

カード効果を実装する場合は、必ず[APIリファレンス](./card-effects/api-reference.md)と[実装例](./card-effects/examples.md)を参照してください。

## コーディング規約

- TypeScript を使用
- コミット時に `lefthook` により `oxlint` と `oxfmt` が自動実行されます
- ソースコードの直接的な操作は避け、提供されているヘルパークラスを使用してください

## セキュリティ

現在のところ、ユーザ固有の情報を保存・利用することはないため、一般的な Web 開発基準に則ります。開発中は HTTP の接続を許容する場合があります。

## ライセンス

このプロジェクトは非営利のファンメイドシミュレータです。CODE OF JOKER は株式会社セガの登録商標です。
