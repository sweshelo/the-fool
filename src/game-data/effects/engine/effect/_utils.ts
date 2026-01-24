import type { Stack } from '@/package/core/class/stack';
import type { Unit } from '@/package/core/class/card';
import { createMessage } from '@/submodule/suit/types';

export const sendSelectedVisualEffect = (stack: Stack, target: Unit) => {
  stack.core.room.broadcastToAll(
    createMessage({
      action: {
        type: 'effect',
        handler: 'client',
      },
      payload: {
        type: 'VisualEffect',
        body: {
          effect: 'select',
          unitId: target.id,
        },
      },
    })
  );
};
