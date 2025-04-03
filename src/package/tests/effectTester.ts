import catalog from '../../database/catalog';
import { Stack } from '../core/class/stack';
import { Core } from '../core/core';
import { Player } from '../core/class/Player';
import { Unit } from '../core/class/card';
import type { Room } from '../server/room/room';

/**
 * カード効果テスター
 * カード効果のテストを行うためのユーティリティクラス
 */
export class EffectTester {
  /**
   * 指定したカードの召喚効果をテストする
   * @param catalogId テスト対象のカードカタログID
   */
  static async testDriveEffect(catalogId: string): Promise<void> {
    console.log(`Testing drive effect for card ${catalogId}...`);

    // モックルーム作成
    const mockRoom = this.createMockRoom();

    // コア作成
    const core = new Core(mockRoom as any);

    // プレイヤー作成
    const player1 = new Player({
      id: 'player1',
      name: 'Player 1',
      deck: [catalogId]
    });

    const player2 = new Player({
      id: 'player2',
      name: 'Player 2',
      deck: ['dummy_card_id']
    });

    // プレイヤーをコアに登録
    core.entry(player1);
    core.entry(player2);

    // テスト用カード作成
    const card = new Unit(catalogId);

    // スタック作成
    const stack = new Stack({
      type: 'drive',
      source: card
    });

    // コアにスタックをセット
    core.stack = [stack];

    // スタック解決
    try {
      await core.resolveStack();
      console.log(`Drive effect for card ${catalogId} successfully processed.`);
    } catch (error) {
      console.error(`Error testing drive effect for card ${catalogId}:`, error);
    }
  }

  /**
   * 指定したカードの破壊効果をテストする
   * @param catalogId テスト対象のカードカタログID
   */
  static async testBreakEffect(catalogId: string): Promise<void> {
    console.log(`Testing break effect for card ${catalogId}...`);

    // モックルーム作成
    const mockRoom = this.createMockRoom();

    // コア作成
    const core = new Core(mockRoom as any);

    // プレイヤー作成
    const player1 = new Player({
      id: 'player1',
      name: 'Player 1',
      deck: [catalogId]
    });

    // プレイヤーをコアに登録
    core.entry(player1);

    // テスト用カード作成
    const card = new Unit(catalogId);
    player1.field.push(card);

    // 破壊元カード（ダミー）を作成
    const sourceCard = new Unit('dummy_source_id');

    // スタック作成
    const stack = new Stack({
      type: 'break',
      source: sourceCard,
      target: card
    });

    // コアにスタックをセット
    core.stack = [stack];

    // スタック解決
    try {
      await core.resolveStack();
      console.log(`Break effect for card ${catalogId} successfully processed.`);
    } catch (error) {
      console.error(`Error testing break effect for card ${catalogId}:`, error);
    }
  }

  /**
   * テスト用のモックルームを作成する
   * @returns モックルーム
   */
  private static createMockRoom(): Partial<Room> {
    return {
      sync: () => {
        console.log('Mock sync called');
      },
      broadcastToAll: (payload: any) => {
        console.log('Mock broadcastToAll called with:', payload);
      },
      broadcastToPlayer: (playerId: string, payload: any) => {
        console.log(`Mock broadcastToPlayer called for player ${playerId} with:`, payload);
      },
      rule: {
        player: {
          max: {
            field: 5,
            hand: 7,
            life: 3,
            trigger: 4,
            cp: 12,
          }
        },
        system: {
          round: 3,
          draw: {
            top: 2,
            override: 1,
          },
          handicap: {
            cp: true,
            draw: true,
          },
          cp: {
            increase: 1,
            init: 2,
          }
        }
      }
    };
  }

  /**
   * テスト用のユーティリティメソッド群
   */
  static async runAllTests(): Promise<void> {
    console.log('Running all effect tests...');

    // カタログからテスト対象のカードをリストアップ
    const driveEffectCards: string[] = [];
    const breakEffectCards: string[] = [];

    catalog.forEach((card, id) => {
      if (typeof card.onDrive === 'function') {
        driveEffectCards.push(id);
      }

      if (typeof card.onBreak === 'function') {
        breakEffectCards.push(id);
      }
    });

    // 召喚効果テスト
    console.log(`Testing ${driveEffectCards.length} cards with drive effects...`);
    for (const id of driveEffectCards) {
      await this.testDriveEffect(id);
    }

    // 破壊効果テスト
    console.log(`Testing ${breakEffectCards.length} cards with break effects...`);
    for (const id of breakEffectCards) {
      await this.testBreakEffect(id);
    }

    console.log('All effect tests completed.');
  }
}

// 単体で実行できるようにするためのエントリポイント
if (require.main === module) {
  EffectTester.runAllTests().catch(console.error);
}
