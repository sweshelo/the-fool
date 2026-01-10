import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkTurnStart: stack => {
    return stack.processing.owner.field.length > 0;
  },

  onTurnStart: async (stack: StackWithCard) => {
    const isOwnTurn = stack.source.id === stack.processing.owner.id;
    await System.show(
      stack,
      '血染めの夜',
      isOwnTurn
        ? '味方全体を破壊\nCP+[破壊したユニット数×1]'
        : '味方全体を破壊\nCP+[破壊したユニット数×2]'
    );
    Effect.modifyCP(
      stack,
      stack.processing,
      stack.processing.owner,
      stack.processing.owner.field.length * (isOwnTurn ? 1 : 2)
    );
    stack.processing.owner.field.forEach(unit => Effect.break(stack, stack.processing, unit));
  },
};
