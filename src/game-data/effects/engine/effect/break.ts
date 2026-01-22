import type { Stack } from '@/package/core/class/stack';
import type { Card } from '@/package/core/class/card';
import { sendSelectedVisualEffect } from './_utils';
import { effectHandes } from './handes';
import { effectMove } from './move';
import { EffectHelper } from '../helper';

export function effectBreak(
  stack: Stack,
  source: Card,
  target: Card,
  cause: 'effect' | 'damage' | 'modifyBp' | 'battle' | 'death' | 'system' = 'effect'
): void {
  const exists = target.owner.find(target);
  const isOnField =
    EffectHelper.isUnit(target) &&
    exists.result &&
    exists.place?.name === 'field' &&
    target.destination !== 'trash';
  if (!exists.result) return;

  switch (exists.place?.name) {
    case 'field': {
      // 既に破壊済みならばスキップ
      if (!isOnField) return;

      // 耐性持ちならばキャンセル
      if (
        cause === 'effect' &&
        target.hasKeyword('破壊効果耐性') &&
        source.owner.id !== target.owner.id
      ) {
        stack.core.room.soundEffect('block');
        return;
      }

      stack.addChildStack('break', source, target, {
        type: 'break',
        cause: cause === 'modifyBp' ? 'effect' : cause,
      });

      target.destination = 'trash';
      stack.core.room.soundEffect('bang');
      sendSelectedVisualEffect(stack, target);
      return;
    }

    case 'hand': {
      effectHandes(stack, source, target);
      return;
    }

    default: {
      effectMove(stack, source, target, 'trash');
      return;
    }
  }
}
