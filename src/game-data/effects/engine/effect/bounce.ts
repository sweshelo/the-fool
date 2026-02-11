import type { Stack } from '@/package/core/class/stack';
import type { Card } from '@/package/core/class/card';
import { sendSelectedVisualEffect } from './_utils';
import { effectMove } from './move';
import { EffectHelper } from '../helper';

export function effectBounce(
  stack: Stack,
  source: Card,
  target: Card,
  location: 'hand' | 'deck' | 'trigger' = 'hand'
): void {
  const exists = target.owner.find(target);
  const isOnField =
    EffectHelper.isUnit(target) &&
    exists.result &&
    exists.place?.name === 'field' &&
    target.leaving?.destination !== location;

  switch (exists.place?.name) {
    case 'field': {
      // 既に移動済みならばスキップ
      if (!isOnField) return;

      // 耐性持ちならばキャンセル
      if (location === 'hand' && target.hasKeyword('固着') && source.owner.id !== target.owner.id) {
        stack.core.room.soundEffect('block');
        return;
      }

      const bounceStack = stack.addChildStack('bounce', source, target, {
        type: 'bounce',
        location,
      });

      if (target.leaving) {
        // 転送先を上書き
        target.leaving.destination = location;
      } else {
        // フィールドの離脱を設定
        target.leaving = {
          stackId: bounceStack.id,
          destination: location,
        };
      }

      stack.core.room.soundEffect('bang');
      sendSelectedVisualEffect(stack, target);
      return;
    }
    default: {
      effectMove(stack, source, target, location);
    }
  }
}
