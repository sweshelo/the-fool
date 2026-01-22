import type { Stack } from '@/package/core/class/stack';
import type { Card, Unit } from '@/package/core/class/card';
import { Delta } from '@/package/core/class/delta';
import { createMessage } from '@/submodule/suit/types';
import type { ModifyBPOption } from './types';
import { effectBreak } from './break';

export function effectModifyBP(
  stack: Stack,
  source: Card,
  target: Unit,
  value: number,
  option: ModifyBPOption
) {
  const exists = target.owner.find(target);
  const isOnField = exists.result && exists.place?.name === 'field';
  if (!isOnField) throw new Error('対象が見つかりませんでした');

  if (target.destination !== undefined) return false;

  if (value === 0) return false;

  if ('isBaseBP' in option) {
    target.bp += value;
  }
  if ('source' in option) {
    target.delta.push(new Delta({ type: 'bp', diff: value }, { source: option.source }));
  }
  if ('event' in option && typeof option.event === 'string') {
    target.delta.push(
      new Delta({ type: 'bp', diff: value }, { event: option.event, count: option.count })
    );
  }

  stack.core.room.broadcastToAll(
    createMessage({
      action: {
        type: 'effect',
        handler: 'client',
      },
      payload: {
        type: 'VisualEffect',
        body: {
          effect: 'status',
          type: 'isBaseBP' in option ? 'base-bp' : 'bp',
          value,
          unitId: target.id,
        },
      },
    })
  );

  stack.core.room.soundEffect(value >= 0 ? 'grow' : 'damage');

  if (target.currentBP <= 0) {
    effectBreak(stack, source, target, 'modifyBp');
    return true;
  }

  return false;
}
