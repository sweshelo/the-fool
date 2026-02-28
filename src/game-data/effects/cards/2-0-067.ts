import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■ダークプリズン
  // ［▼2］あなたのユニットがフィールドに出た時、あなたの紫ゲージが２以下の場合、
  // 対戦相手のトリガーゾーンにあるカードを１枚ランダムで破壊する。
  // ［▲3］あなたのユニットがフィールドに出た時、あなたの紫ゲージが３以上の場合、
  // 対戦相手のトリガーゾーンにあるカードを２枚までランダムで破壊する。

  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    if (!(stack.target instanceof Unit) || stack.target.owner.id !== owner.id) return false;
    return owner.opponent.trigger.length > 0;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    const purple = owner.purple ?? 0;

    if (purple >= 3) {
      const targets = EffectHelper.random(opponent.trigger, 2);
      await System.show(stack, 'ダークプリズン', 'トリガーゾーンのカードを2枚破壊');
      targets.forEach(card => Effect.move(stack, stack.processing, card, 'trash'));
    } else {
      await System.show(stack, 'ダークプリズン', 'トリガーゾーンのカードを1枚破壊');
      EffectHelper.random(opponent.trigger, 1).forEach(card =>
        Effect.move(stack, stack.processing, card, 'trash')
      );
    }
  },
};
