/**
 * テストヘルパー関数
 * テストコンテキストの作成、ユニット作成、イベント記録などを提供
 */
import { Core } from '../index';
import { Player } from '../class/Player';
import { Unit } from '../class/card';
import { AutoResponder } from './auto-responder';
import { createMockRoom } from './mock-room';

export interface TestContext {
  core: Core;
  player1: Player;
  player2: Player;
  autoResponder: AutoResponder;
}

/**
 * テスト用のコンテキストを作成
 * Core, Player, AutoResponder を含む完全なテスト環境を構築
 * NOTE: この関数を呼ぶ前に enableTestMode() を呼んでください
 */
export function createTestContext(): TestContext {
  const autoResponder = new AutoResponder();
  autoResponder.setAutoContinue();
  autoResponder.setAutoSkipBlock();

  let core: Core;
  const mockRoom = createMockRoom(() => core, autoResponder);
  core = new Core(mockRoom);
  core.turn = 2; // ターン1では攻撃できないため

  const player1 = new Player(
    { id: 'player1', name: 'Player 1', deck: { cards: [], jokers: [] } },
    core
  );
  const player2 = new Player(
    { id: 'player2', name: 'Player 2', deck: { cards: [], jokers: [] } },
    core
  );

  core.players.push(player1, player2);

  return { core, player1, player2, autoResponder };
}

/**
 * テスト用のユニットを作成
 * @param owner ユニットのオーナー
 * @param catalogId カタログID（デフォルト: '1-0-001'）
 */
export function createUnit(owner: Player, catalogId: string = '1-0-001'): Unit {
  return new Unit(owner, catalogId);
}

/**
 * イベント記録クラス
 * スタック処理順序などのイベントを記録し、検証する
 */
export class EventRecorder {
  events: string[] = [];

  /**
   * イベントを記録
   */
  record(event: string): void {
    this.events.push(event);
  }

  /**
   * 記録をクリア
   */
  clear(): void {
    this.events = [];
  }

  /**
   * 期待される順序と一致するか検証
   * @throws 順序が一致しない場合にエラーをスロー
   */
  expectOrder(expected: string[]): void {
    if (JSON.stringify(this.events) !== JSON.stringify(expected)) {
      throw new Error(
        `Event order mismatch:\n  Expected: ${JSON.stringify(expected)}\n  Got: ${JSON.stringify(this.events)}`
      );
    }
  }

  /**
   * 特定のイベントが含まれているか検証
   */
  contains(event: string): boolean {
    return this.events.includes(event);
  }

  /**
   * 特定のイベントのインデックスを取得
   * @returns イベントのインデックス、見つからない場合は -1
   */
  indexOf(event: string): number {
    return this.events.indexOf(event);
  }
}
