import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    const targets = [
      ...stack.processing.owner.trigger.filter(card => card.id !== stack.processing.id),
      ...stack.processing.owner.opponent.trigger,
    ];
    return targets.length > 0;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'ダークマター', 'トリガーゾーンを全て破壊');
    [...stack.processing.owner.trigger, ...stack.processing.owner.opponent.trigger].forEach(card =>
      Effect.move(stack, stack.processing, card, 'trash')
    );
  },
};
