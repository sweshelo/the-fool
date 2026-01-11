import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: stack =>
    stack.source.id === stack.processing.owner.id &&
    stack.processing.owner.field.length < stack.processing.owner.opponent.field.length,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, 'アガスティアの葉', 'CP+2');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 2);
  },
};
