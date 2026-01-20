import type { Stack } from '@/package/core/class/stack';
import type { Card, Unit } from '@/package/core/class/card';
import { sendSelectedVisualEffect } from './_utils';
import { effectMove } from './move';

export function effectBounce(
  stack: Stack,
  source: Card,
  target: Unit,
  location: 'hand' | 'deck' | 'trigger' = 'hand'
): void {
  const exists = target.owner.find(target);
  const isOnField =
    exists.result && exists.place?.name === 'field' && target.destination !== location;

  switch (exists.place?.name) {
    case 'field': {
      // 既に移動済みならばスキップ
      if (!isOnField) return;

      // 耐性持ちならばキャンセル
      if (location === 'hand' && target.hasKeyword('固着') && source.owner.id !== target.owner.id) {
        stack.core.room.soundEffect('block');
        return;
      }

      stack.addChildStack('bounce', source, target, {
        type: 'bounce',
        location,
      });
      target.destination = location;
      stack.core.room.soundEffect('bang');
      sendSelectedVisualEffect(stack, target);
      return;
    }
    default: {
      effectMove(stack, source, target, location);
    }
  }
}
