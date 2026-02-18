import type { Stack } from '@/package/core/class/stack';
import type { Card } from '@/package/core/class/card';
import type { Player } from '@/package/core/class/Player';

export function effectModifyCP(stack: Stack, source: Card, target: Player, value: number): void {
  if (value === 0) return;

  const updatedCP = Math.max(
    Math.min(target.cp.current + value, stack.core.room.rule.system.cp.ceil),
    0
  );
  const actualDiff = updatedCP - target.cp.current;
  target.cp.current = updatedCP;

  if (value > 0) {
    if (actualDiff > 0) stack.core.room.soundEffect('cp-increase');
  } else {
    if (actualDiff < 0) stack.core.room.soundEffect('cp-consume');
  }

  stack.addChildStack('modifyCP', source, target, {
    type: 'cp',
    value,
  });
}
