import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■スーパーソニック
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      'スーパーソニック',
      '【スピードムーブ】【不滅】【加護】\n可能なら即時アタック'
    );

    // 【スピードムーブ】【不滅】【加護】をターン終了時まで付与
    Effect.speedMove(stack, stack.processing);
    Effect.keyword(stack, stack.processing, stack.processing, '不滅', {
      event: 'turnEnd',
      count: 1,
    });
    Effect.keyword(stack, stack.processing, stack.processing, '加護', {
      event: 'turnEnd',
      count: 1,
    });

    // 可能なら即時アタック
    await System.sleep(1000);
    await stack.core.attack(stack.processing);
  },

  // ■ダブルスピンアタック
  // このユニットが戦闘に勝利した時、このユニットの行動権を回復する
  onWinSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'ダブルスピンアタック', '行動権を回復');
    Effect.activate(stack, stack.processing, stack.processing, true);
  },

  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'ダブルスピンアタック', '手札に戻る');
    Effect.bounce(stack, stack.processing, stack.processing, 'hand');
  },
};
