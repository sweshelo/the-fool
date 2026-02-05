import type { Stack } from '@/package/core/class/stack';
import type { Card, Unit } from '@/package/core/class/card';
import { effectBreak } from './break';
import { effectKeyword } from './keyword';

export function effectClock(
  stack: Stack,
  source: Card,
  target: Unit,
  value: number,
  withoutOverClock: boolean = false
): void {
  const before = target.lv;

  target.lv += value;
  if (target.lv > 3) target.lv = 3;
  if (target.lv < 1) target.lv = 1;

  if (target.owner.hand.find(card => card.id === target.id)) {
    if (target.lv !== before) {
      if (value > 0) stack.core.room.soundEffect('clock-up');
      if (value < 0) stack.core.room.soundEffect('trash');
    }
    return;
  }

  if (target.lv !== before) {
    if (value > 0) {
      target.delta = target.delta.filter(delta => delta.effect.type !== 'damage');
      stack.core.room.soundEffect('clock-up');
      stack.core.room.soundEffect('clock-up-field');
    } else {
      stack.core.room.soundEffect('damage');
    }

    stack.core.room.visualEffect({
      effect: 'status',
      type: 'level',
      value: target.lv - before,
      unitId: target.id,
    });

    const beforeBBP = target.catalog.bp?.[before - 1] ?? 0;
    const afterBBP = target.catalog.bp?.[target.lv - 1] ?? 0;
    const diff = afterBBP - beforeBBP;
    target.bp += diff;

    stack.addChildStack(`clock${target.lv > before ? 'up' : 'down'}`, source, target, {
      type: 'lv',
      value: target.lv - before,
    });

    if (target.currentBP <= 0) {
      effectBreak(stack, target, target, 'system');
    } else if (target.lv === 3) {
      if (withoutOverClock) {
        target.overclocked = true;
      } else {
        stack.addChildStack('overclock', source, target);
      }
    } else {
      if (value < 0) target.overclocked = false;
    }
  }
}

// Re-export effectKeyword for circular dependency resolution
export { effectKeyword };
