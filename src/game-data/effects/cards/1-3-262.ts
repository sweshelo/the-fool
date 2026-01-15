import { Card } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';

export const effects: CardEffects = {
  checkHandes: stack =>
    stack.source instanceof Card &&
    stack.source.owner.id === stack.processing.owner.id &&
    stack.target instanceof Card &&
    stack.target.owner.id !== stack.processing.owner.id,
  onHandes: async (stack: StackWithCard) => {
    await System.show(stack, '甘露なる苦汁', 'CP+1');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
  },
};
