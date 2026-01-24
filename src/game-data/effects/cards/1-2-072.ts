import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkTurnEnd: stack =>
    stack.processing.owner.field.length <= 0 && stack.source.id !== stack.processing.owner.id,
  onTurnEnd: async (stack: StackWithCard) => {
    await System.show(stack, 'デスティニーコントロール', '2ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -2);
  },
};
