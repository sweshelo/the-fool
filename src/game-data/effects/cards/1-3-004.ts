import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 戦闘時の効果
  onBattleSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // このユニットがアタック中かチェック
    if (stack.target && stack.source.id === stack.processing.id) {
      // 戦闘中の相手ユニットを特定
      const opponent = stack.target;

      if (opponent instanceof Unit) {
        await System.show(stack, '罪炎の魔具', '相手ユニットと同じBPになる');
        const diff = opponent.currentBP - stack.processing.currentBP;
        Effect.modifyBP(stack, stack.processing, stack.processing, diff, {
          event: 'turnEnd',
          count: 1,
        });
      }
    }
  },

  // 自身が破壊された時に発動する効果
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const [target] = EffectHelper.random(stack.processing.owner.opponent.trigger);
    if (target) {
      await System.show(stack, '罪と罰', 'トリガーゾーンを1枚破壊');
      Effect.move(stack, stack.processing, target, 'trash');
    }
  },
};
