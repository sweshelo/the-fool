import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    return (
      stack.processing.owner.field.some(unit => unit.id === stack.target?.id) &&
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id
    );
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const target = stack.target;
    const owner = stack.processing.owner;

    // Type guard and ownership check
    if (!(target instanceof Unit)) return;

    // Determine effect scope based on hand size
    const isHandEmpty = owner.hand.length === 0;

    await System.show(
      stack,
      'グラウンド・ヘヴィ',
      isHandEmpty ? '味方全体に【固着】【無我の境地】' : '【固着】【無我の境地】'
    );

    if (isHandEmpty) {
      // Apply to ALL units on field
      owner.field.forEach(unit => {
        Effect.keyword(stack, stack.processing, unit, '固着');
        Effect.keyword(stack, stack.processing, unit, '無我の境地');
      });
    } else {
      // Apply only to summoned unit
      Effect.keyword(stack, stack.processing, target, '固着');
      Effect.keyword(stack, stack.processing, target, '無我の境地');
    }
  },
};
