import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkDrive: stack =>
    stack.source.id === stack.processing.owner.id &&
    stack.processing.owner.field.length < stack.processing.owner.opponent.field.length,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, 'アガスティアの葉', 'CP+2');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 2);
  },
};
