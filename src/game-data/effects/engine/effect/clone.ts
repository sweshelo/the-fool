import type { Stack } from '@/package/core/class/stack';
import type { Card, Unit } from '@/package/core/class/card';
import type { Player } from '@/package/core/class/Player';
import { sendSelectedVisualEffect } from './_utils';
import { effectSummon } from './summon';

export async function effectClone(
  stack: Stack,
  source: Card,
  target: Unit,
  owner: Player
): Promise<Unit> {
  const unit = target.clone(owner, true);
  stack.core.room.soundEffect('copying');
  sendSelectedVisualEffect(stack, target);
  await new Promise(resolve => setTimeout(resolve, 1000));

  await effectSummon(stack, source, unit, true);
  return unit;
}
