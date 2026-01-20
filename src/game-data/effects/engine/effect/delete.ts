import type { Stack } from '@/package/core/class/stack';
import type { Card, Unit } from '@/package/core/class/card';
import { sendSelectedVisualEffect } from './_utils';

export function effectDelete(stack: Stack, source: Card, target: Unit): void {
  const exists = target.owner.find(target);
  const isOnField =
    exists.result && exists.place?.name === 'field' && target.destination !== 'delete';

  if (!isOnField) return;

  if (target.hasKeyword('消滅効果耐性') && source.owner.id !== target.owner.id) {
    stack.core.room.soundEffect('block');
    return;
  }

  stack.addChildStack('delete', source, target);
  target.destination = 'delete';
  stack.core.room.soundEffect('bang');
  sendSelectedVisualEffect(stack, target);
}
