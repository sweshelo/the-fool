import type { Stack } from '@/package/core/class/stack';
import type { Unit } from '@/package/core/class/card';

export const sendSelectedVisualEffect = (stack: Stack, target: Unit) => {
  stack.core.room.visualEffect({
    effect: 'select',
    unitId: target.id,
  });
};
