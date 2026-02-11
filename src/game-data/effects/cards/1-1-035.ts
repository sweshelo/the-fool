import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkAttack: (stack: StackWithCard) => {
    // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
    return (
      stack.processing.owner.opponent.field.length > 0 &&
      stack.processing.owner.field.length === 1 &&
      stack.processing.owner.id === stack.source.id
    );
  },

  onAttack: async (stack: StackWithCard) => {
    await System.show(stack, '玉璽', '敵全体のユニットの行動権を消費');
    stack.processing.owner.opponent.field.forEach(unit =>
      Effect.activate(stack, stack.processing, unit, false)
    );
  },
};
