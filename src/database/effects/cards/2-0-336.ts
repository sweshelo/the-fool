import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    return stack.processing.owner.id === stack.source.id;
  },

  onDrive: async (stack: StackWithCard) => {
    const uniqueColors = new Set(stack.processing.owner.field.map(unit => unit.catalog.color)).size;
    await System.show(stack, '虹の架け橋', `CP+[フィールドの属性数]`);
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, uniqueColors);
  },
};
