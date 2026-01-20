import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkTurnStart: stack =>
    stack.processing.owner.id === stack.source.id && stack.processing.owner.field.length <= 0,
  onTurnStart: async (stack: StackWithCard) => {
    await System.show(stack, '因果応報', '2ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -2);
  },
};
