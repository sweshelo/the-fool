# プロジェクトアーキテクチャ

このドキュメントでは、The Fool プロジェクトの全体的なアーキテクチャとディレクトリ構造について説明します。

## プロジェクト構造

```
the-fool/
├── src/
│   ├── package/           # コアシステムとサーバー実装
│   │   ├── core/          # ゲームロジック
│   │   │   ├── class/     # ゲームオブジェクトクラス
│   │   │   │   ├── card/  # カード関連クラス
│   │   │   │   ├── Player.ts
│   │   │   │   ├── stack.ts
│   │   │   │   ├── action.ts
│   │   │   │   ├── delta.ts
│   │   │   │   └── parry.ts
│   │   │   ├── core.ts    # コアゲームロジック
│   │   │   └── message.ts # メッセージ処理
│   │   └── server/        # WebSocketサーバー
│   │       ├── index.ts   # サーバーエントリーポイント
│   │       ├── apiRouter.ts
│   │       └── room/      # ルーム管理
│   ├── database/          # ゲームデータ
│   │   ├── catalog.ts     # カードカタログ
│   │   └── effects/       # カード効果実装
│   │       ├── index.ts   # エクスポート
│   │       ├── classes/   # 効果実装用クラス
│   │       │   ├── effect.ts        # Effect クラス
│   │       │   ├── helper.ts        # EffectHelper クラス
│   │       │   ├── system.ts        # System クラス
│   │       │   ├── templates.ts     # EffectTemplate クラス
│   │       │   ├── event.ts         # イベント定義
│   │       │   ├── eventHandlers.ts # イベントハンドラ
│   │       │   └── types.ts         # 型定義
│   │       └── cards/     # 個別のカード効果実装
│   │           ├── _guide.md        # 実装ガイド（旧）
│   │           ├── 1-0-019.ts
│   │           ├── 1-0-027.ts
│   │           └── ...
│   ├── submodule/
│   │   └── suit/          # 共通型定義（サブモジュール）
│   └── config.ts          # 設定ファイル
├── docs/                  # ドキュメント
├── certs/                 # SSL証明書（手動作成）
├── index.ts               # アプリケーションエントリーポイント
├── package.json
├── tsconfig.json
└── lefthook.yml           # Git フック設定
```

## コンポーネント概要

### 1. Core System (`src/package/core/`)

ゲームの核となるロジックを実装しています。

#### 主要クラス

##### Card 関連 (`class/card/`)

- **Card.ts** - カードの基底クラス
- **Unit.ts** - ユニットカード
- **Atom.ts** - アトムカード（スペルなど）
- **Trigger.ts** - トリガーカード
- **Intercept.ts** - インターセプトカード

##### ゲームロジック

- **Player.ts** - プレイヤーの状態管理（手札、フィールド、捨札など）
- **stack.ts** - スタック処理（効果の解決順序管理）
- **action.ts** - ゲームアクション定義
- **delta.ts** - 状態変更の差分管理
- **parry.ts** - 防御処理
- **core.ts** - コアゲームロジック

#### Stack とは

The Fool では、カードの効果やアクションは「スタック」という構造で管理されます。スタックは効果の解決順序を制御し、以下の情報を保持します：

- **processing** - 効果を発動しているカード
- **source** - 効果の発生源（プレイヤーなど）
- **target** - 効果の対象

詳細は [カード効果実装ガイド](./card-effects/implementation-guide.md#stack) を参照してください。

#### Delta とは

Delta は、ユニットの状態変更（BP の増減、キーワード付与など）を表すオブジェクトです。
永続効果を実装する際に使用され、効果の重複を防ぎます。

詳細は [カード効果実装ガイド](./card-effects/implementation-guide.md#永続効果) を参照してください。

### 2. Server (`src/package/server/`)

WebSocket サーバーの実装です。

- **index.ts** - サーバーのセットアップとエントリーポイント
- **apiRouter.ts** - API ルーティング
- **room/** - ゲームルームとユーザー管理

### 3. Database (`src/database/`)

ゲームデータとカード効果の実装を格納しています。

#### catalog.ts

カードのメタデータ（カード ID、名前、コスト、BP、テキストなど）を定義します。

#### effects/

カードの効果実装が格納されています。

##### classes/

カード効果を実装するためのヘルパークラス群：

- **effect.ts** - `Effect` クラス - 破壊、移動、ダメージなどのゲーム操作
- **helper.ts** - `EffectHelper` クラス - ユニット選択、ランダム処理などのユーティリティ
- **system.ts** - `System` クラス - 選択プロンプト、効果表示などの UI 操作
- **templates.ts** - `EffectTemplate` クラス - 頻出効果のテンプレート
- **event.ts** - イベント定義
- **eventHandlers.ts** - イベントハンドラ定義
- **types.ts** - 型定義

詳細は [API リファレンス](./card-effects/api-reference.md) を参照してください。

##### cards/

個別のカード効果実装ファイル。ファイル名はカード ID（例: `1-0-019.ts`）に対応します。

カード効果の実装方法は [カード効果実装ガイド](./card-effects/implementation-guide.md) を参照してください。

### 4. Submodule (`src/submodule/suit/`)

型定義の共有用サブモジュール。`the-magician`（Web UI）との共通型を定義しています。

## データフロー

```
Client (the-magician)
    ↓ WebSocket
Server (src/package/server)
    ↓ API Router
Core (src/package/core)
    ↓ Stack
Card Effects (src/database/effects)
    ↓ Effect/Helper Classes
Game State Update
    ↓ Message
Client (the-magician)
```

### 処理フロー例：カードの召喚

1. クライアントが召喚アクションを送信
2. サーバーが受信し、Core に処理を委譲
3. Core がスタックを生成
4. カードの `onDriveSelf` イベントが発火
5. 効果実装が `Effect` クラスを使用してゲーム状態を更新
6. Delta が生成され、状態変更が記録
7. 更新がメッセージとしてクライアントに送信
8. クライアントが UI を更新

## 設計原則

### 1. ゲームロジックの分離

ゲームロジック（Core）とサーバー実装（Server）は分離されています。
これにより、異なるフロントエンドやプラットフォームでの再利用が可能です。

### 2. 効果の抽象化

カード効果は `Effect` や `EffectHelper` などの抽象化されたインターフェースを通じて実装されます。
これにより、ゲームオブジェクトを直接操作することなく、安全に効果を実装できます。

### 3. イベント駆動

カードの効果はイベント（`onDrive`, `onBreak`, `onDamage` など）に応じて発火します。
これにより、複雑な効果の連鎖を管理できます。

### 4. 型安全性

TypeScript の型システムを活用し、コンパイル時に多くのエラーを検出します。
共通型は `suit` サブモジュールで管理され、複数のプロジェクト間で共有されます。

## 技術スタック詳細

### ランタイム: Bun

Bun は高速な JavaScript/TypeScript ランタイムです。Node.js と互換性がありながら、以下の利点があります：

- 高速な起動時間
- ネイティブな TypeScript サポート
- 組み込みのバンドラーとテストランナー

### リンター・フォーマッター: oxlint / oxfmt

Rust で書かれた高速なリンターとフォーマッターを使用しています。

### Git フック: lefthook

Git コミット時に自動的にリンターとフォーマッターを実行し、コード品質を維持します。

## 拡張とカスタマイズ

### 新しいカード効果の追加

1. `src/database/catalog.ts` にカードデータを追加
2. `src/database/effects/cards/[カードID].ts` に効果実装を追加
3. [カード効果実装ガイド](./card-effects/implementation-guide.md) に従って実装

### 新しいイベントの追加

1. `src/database/effects/classes/event.ts` にイベント定義を追加
2. `src/database/effects/classes/eventHandlers.ts` にハンドラを追加
3. Core のイベント発火ロジックを更新

## 関連ドキュメント

- [環境構築とセットアップ](./getting-started.md)
- [カード効果実装ガイド](./card-effects/implementation-guide.md)
- [API リファレンス](./card-effects/api-reference.md)
- [実装例](./card-effects/examples.md)
