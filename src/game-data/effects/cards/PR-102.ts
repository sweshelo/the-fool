import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    return (
      stack.processing.owner.id === stack.source.id &&
      [...stack.processing.owner.opponent.trigger, ...stack.processing.owner.trigger].length >= 5
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '微笑の占い師', 'トリガーゾーンを2枚まで破壊');
    EffectHelper.random(stack.processing.owner.opponent.trigger, 2).forEach(card =>
      Effect.move(stack, stack.processing, card, 'trash')
    );
  },
};
