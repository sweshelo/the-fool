import type { Stack } from '@/package/core/class/stack';
import type { Card, Unit } from '@/package/core/class/card';

export function effectActivate(stack: Stack, source: Card, target: Unit, activate: boolean) {
  if (!activate && target.hasKeyword('無我の境地') && target.owner.id !== source.owner.id) {
    stack.core.room.soundEffect('block');
    return;
  }

  target.active = activate;
}
