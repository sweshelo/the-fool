# AIエージェント・開発者向けガイド

このドキュメントは、AIエージェントや新規開発者がプロジェクトに参加する際の出発点となります。

## ドキュメント構成

詳細なドキュメントは `/docs` ディレクトリに整理されています：

### 📚 主要ドキュメント

1. **[ドキュメントトップ](./docs/README.md)** - ドキュメント全体の目次とナビゲーション
2. **[環境構築](./docs/getting-started.md)** - 開発環境のセットアップ手順
3. **[アーキテクチャ](./docs/architecture.md)** - プロジェクトの全体構造と設計原則
4. **[カード効果実装ガイド](./docs/card-effects/implementation-guide.md)** - カード効果の実装方法
5. **[API リファレンス](./docs/card-effects/api-reference.md)** - Effect、EffectHelper、System などの API
6. **[実装例](./docs/card-effects/examples.md)** - よくあるカード効果の実装例

## クイックスタート

### 1. 環境構築

```bash
# 依存関係のインストール
bun install

# サブモジュールの初期化
git submodule update --init --recursive

# 開発サーバーの起動
bun dev
```

詳細は [環境構築ドキュメント](./docs/getting-started.md) を参照してください。

### 2. プロジェクト理解

[アーキテクチャドキュメント](./docs/architecture.md) でプロジェクト構造を理解してください。

主要なディレクトリ：

- `src/package/core/` - ゲームロジック
- `src/game-data/effects/` - カード効果実装
- `src/package/server/` - WebSocket サーバー

### 3. カード効果の実装

カード効果を実装する場合は、以下の順序でドキュメントを読んでください：

1. [カード効果実装ガイド](./docs/card-effects/implementation-guide.md) - 基本的なルールと構造
2. [API リファレンス](./docs/card-effects/api-reference.md) - 利用可能なクラスとメソッド
3. [実装例](./docs/card-effects/examples.md) - 実際の実装パターン

## リポジトリ概要

このリポジトリは CODE OF JOKER のシミュレータを WebSocket サーバの形で提供します。

### 主要コンポーネント

- **コアシステム** (`src/package/core`) - ゲームロジックとルール実装
- **ゲームデータ** (`src/game-data`) - カードデータと効果実装
- **サーバー** (`src/package/server`) - WebSocket サーバーとルーム管理

## コーディング規約

- **言語**: TypeScript
- **ランタイム**: Bun
- **リンター**: oxlint
- **フォーマッター**: oxfmt
- **Git フック**: lefthook（コミット時に自動実行）

### コーディング規約

- アサーションなど、型の安全性を損なう記述は禁止です。
- 変数名はキャメルケースを使用します

### カード効果実装 重要なルール

1. **ゲームオブジェクトを直接操作しない** - Effect、EffectHelper、System クラスを使用する
2. **永続効果は Delta を使用する** - 効果の重複を防ぐため
3. **System.show() を適切に呼ぶ** - 効果を発動する前に必ず呼び出す

詳細は [カード効果実装ガイド](./docs/card-effects/implementation-guide.md) を参照してください。

## セキュリティ

現在のところ、ユーザ固有の情報を保存・利用することはないため、一般的な Web 開発基準に則ります。開発中は HTTP の接続を許容する場合があります。

## ビルド・テスト

- **ビルド**: 特殊な設定は不要（Bun が TypeScript を直接実行）
- **テスト**: 現在のところテストコードはありません（今後追加予定）

## 関連リポジトリ

- [the-magician](https://github.com/sweshelo/the-magician) - Web UI クライアント
- [suit](https://github.com/sweshelo/suit) - 共通型定義（サブモジュール）

## トラブルシューティング

問題が発生した場合は、[環境構築ドキュメント](./docs/getting-started.md#トラブルシューティング) を参照してください。

## 次のステップ

1. [環境構築](./docs/getting-started.md) でセットアップを完了する
2. [アーキテクチャ](./docs/architecture.md) でプロジェクト構造を理解する
3. [カード効果実装ガイド](./docs/card-effects/implementation-guide.md) で実装方法を学ぶ
4. [実装例](./docs/card-effects/examples.md) を参考に実際に実装する
