import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: stack => {
    return stack.source.id === stack.processing.owner.id && stack.processing.owner.field.length > 0;
  },

  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '突撃の合図', '味方全体に【スピードムーブ】を与える');
    stack.processing.owner.field.forEach(unit => Effect.speedMove(stack, unit));
  },
};
