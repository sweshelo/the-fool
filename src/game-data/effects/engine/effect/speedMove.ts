import type { Stack } from '@/package/core/class/stack';
import type { Unit } from '@/package/core/class/card';

export function effectSpeedMove(stack: Stack, target: Unit) {
  if (target.hasKeyword('行動制限') && !target.hasKeyword('沈黙')) {
    target.delta = target.delta.filter(
      delta => !(delta.effect.type === 'keyword' && delta.effect.name === '行動制限')
    );
    stack.core.room.soundEffect('speedmove');
  }
}
