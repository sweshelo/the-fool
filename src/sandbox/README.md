# Sandbox Environment

AIエージェントがゲームに対して手の評価をするためのサンドボックス環境です。

## 機能

- **固定の部屋番号 (99999)** でのサンドボックス起動
- **任意のフィールドを構築する機能** (`SyncPayload` の内容から状態を復元)
- **プレイヤーが揃っていなくてもゲーム開始可能**
- **マリガンなし** (スキップ)

## 有効化方法

サンドボックスモードは **ローカル環境でのみ有効** です。

環境変数を設定してサーバーを起動します:

```bash
SANDBOX_MODE=true PORT=3000 bun run index.ts
```

## API エンドポイント

### GET /api/sandbox/status

サンドボックスモードの状態を取得します。

**レスポンス例:**
```json
{
  "enabled": true,
  "roomId": "99999",
  "roomExists": false,
  "playerCount": 0
}
```

### POST /api/sandbox/create

サンドボックスルームを作成します。

**レスポンス例:**
```json
{
  "success": true,
  "roomId": "99999"
}
```

### POST /api/sandbox/load-state

SyncPayload の内容からゲーム状態を復元します。

**リクエストボディ:**
```json
{
  "game": {
    "round": 3,
    "turn": 5
  },
  "players": {
    "player-id-1": {
      "id": "player-id-1",
      "name": "Player 1",
      "deck": [{"id": "card-1"}, {"id": "card-2"}],
      "hand": [{"id": "card-3", "catalogId": "1-0-001", "lv": 1}],
      "field": [...],
      "trash": [...],
      "delete": [...],
      "trigger": [...],
      "cp": {"current": 5, "max": 5},
      "life": {"current": 6, "max": 8},
      "joker": {"card": [], "gauge": 30},
      "purple": null
    },
    "player-id-2": {...}
  },
  "rule": {...}
}
```

**レスポンス例:**
```json
{
  "success": true,
  "message": "State loaded successfully",
  "round": 3,
  "turn": 5
}
```

### POST /api/sandbox/start

サンドボックスゲームを開始します（マリガンなし）。

**レスポンス例:**
```json
{
  "success": true,
  "message": "Sandbox game started",
  "playerCount": 1
}
```

### DELETE /api/sandbox/destroy

サンドボックスルームを破棄します。

**レスポンス例:**
```json
{
  "success": true,
  "message": "Sandbox room 99999 destroyed"
}
```

## ダミーカードについて

`sync()` で送信される相手の非公開情報（`hand`, `deck`, `trigger`）は `IAtom` 型（`id` のみ）で送信されます。これらのデータからカードを復元する場合、`catalogId` 情報がないため、`DummyCard` クラスが使用されます。

- `DummyCard`: 効果を持たないプレースホルダーカード
- `DummyUnit`: フィールド上の情報を持つが効果を持たないユニット

`catalogId` が存在するカードデータの場合は、実際のカードオブジェクト（`Unit`, `Evolve`, `Intercept`, `Trigger`）が生成されます。

## 使用例

```typescript
import { SandboxRoom, loadState } from '@/sandbox';

// サンドボックスルームを作成
const room = new SandboxRoom('Test Room');

// プレイヤーを追加（通常のWebSocket接続経由）
// ...

// 状態をロード
room.loadState({
  game: { round: 3, turn: 5 },
  players: {
    // ... プレイヤー状態
  },
  rule: room.rule
});

// ゲームを開始（マリガンなし）
room.startSandbox();
```

## 注意事項

- **本番デプロイ時は無効化すること**: `SANDBOX_MODE=true` を設定しないことで自動的に無効化されます
- サンドボックスモードが無効な場合、すべてのAPIエンドポイントは `403 Forbidden` を返します
