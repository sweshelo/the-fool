import type { Stack } from '@/package/core/class/stack';
import type { Card, Unit } from '@/package/core/class/card';
import { Delta, type DeltaSource } from '@/package/core/class/delta';
import { effectBreak } from './break';

export function effectDynamicBP(
  stack: Stack,
  source: Card,
  target: Unit,
  calculator: (self: Card) => number,
  option: { source: DeltaSource }
) {
  const exists = target.owner.find(target);
  const isOnField = exists.result && exists.place?.name === 'field';
  if (!isOnField) throw new Error('対象が見つかりませんでした');

  const value = calculator(target);
  target.delta.push(
    new Delta({ type: 'dynamic-bp', diff: value }, { source: option.source, calculator })
  );

  if (value !== 0) {
    stack.core.room.visualEffect({
      effect: 'status',
      type: 'bp',
      value,
      unitId: target.id,
    });
    stack.core.room.soundEffect(value >= 0 ? 'grow' : 'damage');
  }

  if (target.currentBP <= 0) {
    effectBreak(stack, source, target, 'modifyBp');
    return true;
  }

  return false;
}
