# マッチング API リファレンス

このドキュメントでは、マッチングシステムのクライアント実装に必要な情報を説明します。

## 概要

マッチングシステムは、同じモードでマッチングを希望するプレイヤー同士を自動的にマッチングし、対戦ルームを作成します。

### マッチングモード

| モード | 説明 |
|--------|------|
| `freedom` | 制限なし。全カード使用可能。 |
| `standard` | Ver.1.2（version >= 6）以降のカードのみ。同名カード3枚まで。 |
| `legacy` | Ver.1.4EX1以前のカードのみ。1stジョーカー、手札加算方式。 |
| `limited` | デッキ合計オリジナリティ100以上必須。 |

## メッセージフロー

### 正常系: マッチング成立

```text
┌────────┐                              ┌────────┐
│ Client │                              │ Server │
└───┬────┘                              └───┬────┘
    │                                       │
    │  MatchingStartRequest                 │
    │  (mode, player, deck)                 │
    │──────────────────────────────────────>│
    │                                       │
    │  MatchingStartResponse                │
    │  (queueId, position)                  │
    │<──────────────────────────────────────│
    │                                       │
    │         ... 相手を待機中 ...           │
    │                                       │
    │  MatchingSuccess                      │
    │  (roomId, opponentName, mode)         │
    │<──────────────────────────────────────│
    │                                       │
    │   → Sync（ゲーム状態の同期）へ         │
```

### 正常系: マッチングキャンセル

```text
┌────────┐                              ┌────────┐
│ Client │                              │ Server │
└───┬────┘                              └───┬────┘
    │                                       │
    │  MatchingCancelRequest                │
    │──────────────────────────────────────>│
    │                                       │
    │  MatchingCancelResponse               │
    │<──────────────────────────────────────│
```

### 異常系: デッキバリデーションエラー

```text
┌────────┐                              ┌────────┐
│ Client │                              │ Server │
└───┬────┘                              └───┬────┘
    │                                       │
    │  MatchingStartRequest                 │
    │  (不正なデッキ構成)                    │
    │──────────────────────────────────────>│
    │                                       │
    │  Error                                │
    │  (MATCHING_INVALID_DECK)              │
    │<──────────────────────────────────────│
```

## クライアント → サーバー（リクエスト）

### MatchingStartRequest

マッチングキューへの参加を要求します。

```typescript
interface MatchingStartRequestPayload {
  type: 'MatchingStartRequest';
  mode: 'freedom' | 'standard' | 'legacy' | 'limited';
  player: {
    name: string;    // プレイヤー名
    id: string;      // プレイヤーID
    deck: string[];  // カードIDの配列（40枚）
  };
  jokersOwned?: string[];  // 所持ジョーカーID（省略可）
}
```

**送信タイミング**: ユーザーがマッチングモードを選択し、マッチング開始ボタンを押したとき

**実装例**:

```typescript
function startMatching(mode: MatchingMode, player: Player, deck: string[]) {
  const payload: MatchingStartRequestPayload = {
    type: 'MatchingStartRequest',
    mode,
    player: {
      name: player.name,
      id: player.id,
      deck,
    },
  };

  socket.send(JSON.stringify(payload));
}
```

### MatchingCancelRequest

マッチングキューからの離脱を要求します。

```typescript
interface MatchingCancelRequestPayload {
  type: 'MatchingCancelRequest';
}
```

**送信タイミング**: ユーザーがマッチングキャンセルボタンを押したとき

**実装例**:

```typescript
function cancelMatching() {
  const payload: MatchingCancelRequestPayload = {
    type: 'MatchingCancelRequest',
  };

  socket.send(JSON.stringify(payload));
}
```

## サーバー → クライアント（レスポンス/通知）

### MatchingStartResponse

キューへの参加が成功したことを通知します。

```typescript
interface MatchingStartResponsePayload {
  type: 'MatchingStartResponse';
  queueId: string;   // キューID（キャンセル時の識別に使用）
  position: number;  // キュー内の順番
}
```

**受信時の処理**:

- マッチング待機画面に遷移
- キュー内順番の表示（任意）

### MatchingSuccess

マッチングが成立したことを通知します。

```typescript
interface MatchingSuccessPayload {
  type: 'MatchingSuccess';
  roomId: string;      // 作成されたルームID
  opponentName: string; // 対戦相手の名前
  mode: 'freedom' | 'standard' | 'legacy' | 'limited';
}
```

**受信時の処理**:

- 対戦準備画面への遷移
- 対戦相手名の表示
- この後すぐに `Sync` メッセージが送信され、ゲーム状態の同期が開始される

### MatchingCancelResponse

キャンセルが成功したことを通知します。

```typescript
interface MatchingCancelResponsePayload {
  type: 'MatchingCancelResponse';
}
```

**受信時の処理**:

- モード選択画面などに戻る

### Error

エラーが発生したことを通知します。

```typescript
interface ErrorPayload {
  type: 'Error';
  errorCode: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
}
```

#### マッチング関連エラーコード

| エラーコード | 定数名 | 説明 | 対処方法 |
|------------|--------|------|---------|
| `MATCHING_001` | `MATCHING_ALREADY_QUEUED` | 既にマッチングキューに参加している | キャンセルしてから再度参加 |
| `MATCHING_002` | `MATCHING_QUEUE_NOT_FOUND` | キャンセル対象のキューが見つからない | 既にマッチングが成立した可能性 |
| `MATCHING_003` | `MATCHING_TIMEOUT` | マッチングがタイムアウトした | 再度マッチングを開始 |
| `MATCHING_004` | `MATCHING_CANCELLED` | マッチングがキャンセルされた | - |
| `MATCHING_005` | `MATCHING_INVALID_CRITERIA` | マッチング条件が無効 | リクエスト内容を確認 |
| `MATCHING_006` | `MATCHING_INVALID_DECK` | デッキがモードの条件を満たさない | デッキを再構成 |

**実装例**:

```typescript
function handleError(payload: ErrorPayload) {
  switch (payload.errorCode) {
    case 'MATCHING_006':
      // デッキエラー: details にエラー詳細が含まれる
      showDeckError(payload.message, payload.details);
      break;
    case 'MATCHING_001':
      // 既にキューに参加中: キャンセルを促す
      showAlreadyQueuedWarning();
      break;
    default:
      showGenericError(payload.message);
  }
}
```

## モード別デッキ制限

### freedom（フリーダム）

制限なし。全てのカードが使用可能。

| 項目 | 条件 |
|------|------|
| カード制限 | 特になし |
| ルール変更 | 特になし |
| デッキ制限 | 特になし |

### standard（スタンダード）

| 項目 | 条件 |
|------|------|
| カード制限 | Ver.1.2（version >= 6）以降のカードのみ |
| ルール変更 | 特になし |
| デッキ制限 | 同名カード3枚まで |

### legacy（レガシー）

| 項目 | 条件 |
|------|------|
| カード制限 | Ver.1.4EX2（version <= 14）以前のカードのみ |
| ルール変更 | 1stジョーカー方式、手札加算方式 |
| デッキ制限 | 同名カード3枚まで |

**legacy モードのルール変更詳細**:

- 自傷ダメージによるジョーカーゲージ増加あり
- シングルジョーカー制（2枚目のジョーカーは使用不可）
- ジョーカーは手札に加算される

### limited（リミテッド）

| 項目 | 条件 |
|------|------|
| カード制限 | なし |
| デッキ制限 | デッキ全体の合計オリジナリティが100以上、同名カード3枚まで |

## 完全な実装例

```typescript
type MatchingMode = 'freedom' | 'standard' | 'legacy' | 'limited';

interface MatchingState {
  isMatching: boolean;
  queueId: string | null;
  position: number | null;
}

class MatchingClient {
  private socket: WebSocket;
  private state: MatchingState = {
    isMatching: false,
    queueId: null,
    position: null,
  };

  constructor(socket: WebSocket) {
    this.socket = socket;
    this.setupMessageHandler();
  }

  private setupMessageHandler() {
    this.socket.addEventListener('message', (event) => {
      const payload = JSON.parse(event.data);
      this.handleMessage(payload);
    });
  }

  private handleMessage(payload: unknown) {
    const typed = payload as { type: string };

    switch (typed.type) {
      case 'MatchingStartResponse':
        this.handleMatchingStartResponse(payload as MatchingStartResponsePayload);
        break;
      case 'MatchingSuccess':
        this.handleMatchingSuccess(payload as MatchingSuccessPayload);
        break;
      case 'MatchingCancelResponse':
        this.handleMatchingCancelResponse();
        break;
      case 'Error':
        this.handleError(payload as ErrorPayload);
        break;
    }
  }

  // マッチング開始
  startMatching(mode: MatchingMode, player: Player, deck: string[]) {
    if (this.state.isMatching) {
      console.warn('既にマッチング中です');
      return;
    }

    const payload = {
      type: 'MatchingStartRequest',
      mode,
      player: {
        name: player.name,
        id: player.id,
        deck,
      },
    };

    this.socket.send(JSON.stringify(payload));
  }

  // マッチングキャンセル
  cancelMatching() {
    if (!this.state.isMatching) {
      console.warn('マッチング中ではありません');
      return;
    }

    const payload = {
      type: 'MatchingCancelRequest',
    };

    this.socket.send(JSON.stringify(payload));
  }

  private handleMatchingStartResponse(payload: MatchingStartResponsePayload) {
    this.state.isMatching = true;
    this.state.queueId = payload.queueId;
    this.state.position = payload.position;

    // UI更新: マッチング待機画面を表示
    this.onMatchingStarted?.(payload.position);
  }

  private handleMatchingSuccess(payload: MatchingSuccessPayload) {
    this.state.isMatching = false;
    this.state.queueId = null;
    this.state.position = null;

    // UI更新: 対戦開始画面へ遷移
    this.onMatchingSuccess?.(payload.roomId, payload.opponentName, payload.mode);
  }

  private handleMatchingCancelResponse() {
    this.state.isMatching = false;
    this.state.queueId = null;
    this.state.position = null;

    // UI更新: モード選択画面へ戻る
    this.onMatchingCancelled?.();
  }

  private handleError(payload: ErrorPayload) {
    if (payload.errorCode.startsWith('MATCHING_')) {
      this.state.isMatching = false;
      this.state.queueId = null;
      this.state.position = null;
    }

    // UI更新: エラー表示
    this.onError?.(payload.errorCode, payload.message, payload.details);
  }

  // コールバック（UIレイヤーで設定）
  onMatchingStarted?: (position: number) => void;
  onMatchingSuccess?: (roomId: string, opponentName: string, mode: MatchingMode) => void;
  onMatchingCancelled?: () => void;
  onError?: (code: string, message: string, details?: Record<string, unknown>) => void;
}
```

## MatchingStatus（リアルタイム配信）

サーバーは全接続クライアントに対して、マッチングキューの状況とアクティブなゲーム数をリアルタイムで配信します。

### MatchingStatusPayload

```typescript
interface MatchingStatusPayload {
  type: 'MatchingStatus';
  queues: {
    freedom: number;   // フリーダムモードの待機人数
    standard: number;  // スタンダードモードの待機人数
    legacy: number;    // レガシーモードの待機人数
    limited: number;   // リミテッドモードの待機人数
  };
  activeGames: number; // マッチングで作成された進行中の試合数
  timestamp: number;
}
```

### 配信タイミング

以下のイベント発生時に全クライアントに自動配信されます:

- プレイヤーがマッチングキューに参加したとき
- マッチングが成立したとき（キューの減少 + アクティブゲーム数の増加）
- プレイヤーがマッチングをキャンセルしたとき
- プレイヤーが切断してキューから削除されたとき
- マッチングルームが削除されたとき（全プレイヤー退室・切断時）
- 定期クリーンアップで空のルームが削除されたとき

### オンデマンド取得

クライアントから `matchingStatus` アクションを送信することで、現在の状況を個別に取得できます。

```typescript
socket.send(JSON.stringify({
  action: { type: 'matchingStatus', handler: 'server' },
  payload: { type: 'MatchingStatusRequest' },
}));
```

### 実装例

```typescript
function handleMatchingStatus(payload: MatchingStatusPayload) {
  const totalWaiting = payload.queues.freedom + payload.queues.standard
    + payload.queues.legacy + payload.queues.limited;

  updateUI({
    waitingPlayers: totalWaiting,
    activeGames: payload.activeGames,
    queuesByMode: payload.queues,
  });
}
```

## suit サブモジュール変更

この機能の追加に伴い、[suit](https://github.com/sweshelo/suit) サブモジュールに以下の変更が必要です。

### `types/message/payload/client.ts` - MatchingStatusPayload

`activeGames` フィールドを追加する:

```diff
 export interface MatchingStatusPayload extends BasePayload {
   type: 'MatchingStatus';
   queues: {
     freedom: number;
     standard: number;
     legacy: number;
     limited: number;
   };
+  activeGames: number;
   timestamp: number;
 }
```

suit リポジトリ側でこの変更をコミット・プッシュした後、the-fool 側でサブモジュールの参照を更新してください。

## 関連ドキュメント

- [アーキテクチャ](./architecture.md) - プロジェクト構成の概要
- [環境構築](./getting-started.md) - 開発環境のセットアップ
