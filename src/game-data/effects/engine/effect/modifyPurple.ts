import type { Stack } from '@/package/core/class/stack';
import type { Card } from '@/package/core/class/card';
import type { Player } from '@/package/core/class/Player';

export async function effectModifyPurple(
  stack: Stack,
  source: Card,
  target: Player,
  value: number
): Promise<void> {
  if (value === 0) return;

  if (target.purple === undefined) target.purple = 0;
  const updatedPurple = Math.min(Math.max(target.purple + value, 0), 5);

  stack.addChildStack('modifyPurple', source, target, {
    type: 'purple',
    value,
  });

  const count = Math.abs(updatedPurple - (target.purple ?? 0));
  for (let i = 0; i < count; i++) {
    if (value > 0) {
      stack.core.room.soundEffect('purple-increase');
      target.purple += 1;
    } else {
      stack.core.room.soundEffect('purple-consume');
      target.purple -= 1;
    }
    stack.core.room.sync();
    await new Promise(resolve => setTimeout(resolve, 250));
  }
}
