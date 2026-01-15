import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkDrive: stack => {
    return stack.processing.owner.id === stack.source.id;
  },

  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '追い風', 'CP+4');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 4);
  },
};
