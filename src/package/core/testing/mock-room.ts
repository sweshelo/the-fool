/**
 * テスト用のモックRoom
 * WebSocket通信をモックし、プロンプトを自動応答する
 */
import { mock } from 'bun:test';
import type { Room } from '@/package/server/room/room';
import type { Core } from '../index';
import type { AutoResponder } from './auto-responder';

type MessagePayload = {
  type?: string;
  promptId?: string;
  choices?: {
    type: string;
    items?: Array<{ id: string }>;
    isCancelable?: boolean;
  };
};

type Message = {
  action?: {
    type?: string;
    handler?: string;
  };
  payload?: MessagePayload;
};

/**
 * テスト用のMockRoomを作成
 * @param getCore Coreインスタンスを取得する関数（遅延評価で循環参照を回避）
 * @param autoResponder 自動応答クラス
 */
type PromptPayload = {
  type: string;
  promptId?: string;
  choices?: {
    type: string;
    items?: Array<{ id: string }>;
    isCancelable?: boolean;
  };
};

export function createMockRoom(getCore: () => Core, autoResponder: AutoResponder): Room {
  const handleMessage = (message: Message) => {
    // プロンプトを自動応答
    if (message.action?.type === 'pause' && message.payload?.promptId && message.payload.type) {
      const promptId = message.payload.promptId;
      const payloadType = message.payload.type;
      const payload = message.payload;

      // PromptPayload 型として明示的に構築
      const promptPayload: PromptPayload = {
        type: payloadType,
        promptId: payload.promptId,
        choices: payload.choices,
      };

      // 次のイベントループで応答（非同期処理をシミュレート）
      setTimeout(() => {
        const response = autoResponder.respond(promptId, promptPayload);
        const core = getCore();
        if (response === undefined) {
          core.handleContinue(promptId);
        } else {
          core.handleEffectResponse(promptId, response);
        }
      }, 0);
    }
  };

  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- Room は循環参照があるためモックが必要
  const mockRoom = {
    id: 'test-room',
    sync: mock(() => {}),
    soundEffect: mock(() => {}),
    broadcastToAll: mock((message: Message) => {
      handleMessage(message);
    }),
    broadcastToPlayer: mock((_playerId: string, message: Message) => {
      handleMessage(message);
    }),
    rule: {
      player: { max: { hand: 7, trigger: 4, field: 5, life: 8 } },
      system: {
        cp: { ceil: 12, increase: 1, init: 2, carryover: false, max: 7 },
        round: 10,
        turnTime: 120,
        draw: { top: 2, override: 1, mulligan: 4 },
        handicap: { attack: false, cp: false, draw: false },
      },
      misc: { strictOverride: false, suicideJoker: false },
      joker: { gauge: 0, inHand: false },
    },
  } as unknown as Room;

  return mockRoom;
}
