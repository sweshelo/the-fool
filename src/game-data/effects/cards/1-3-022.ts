import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対戦相手の手札が2枚以下の場合
    // あなたの捨札にあるカードを1枚ランダムで手札に加える
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    if (opponent.hand.length <= 2 && owner.trash.length > 0) {
      await System.show(stack, 'ラブリィ・マミー', '捨札から1枚回収');
      EffectHelper.random(owner.trash).forEach(target => {
        Effect.bounce(stack, stack.processing, target, 'hand');
      });
    }
  },

  // このユニットが破壊された時
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    // 対戦相手の手札が2枚以下の場合
    if (opponent.hand.length <= 2) {
      // 対戦相手に1ライフダメージを与える
      await System.show(stack, 'ラブリィ・マミー', '1ライフダメージ');
      Effect.modifyLife(stack, stack.processing, opponent, -1);
    }
  },
};
