import { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkAttack: stack =>
    stack.processing.owner.field.length <= 0 &&
    stack.source.id !== stack.processing.owner.id &&
    stack.processing.owner.opponent.field.some(unit => unit.id === stack.target?.id),
  onAttack: async (stack: StackWithCard) => {
    if (stack.target instanceof Unit) {
      await System.show(stack, '帰還', '手札に戻す');
      Effect.bounce(stack, stack.processing, stack.target, 'hand');
    }
  },
};
