import type { Stack } from '@/package/core/class/stack';
import type { Card } from '@/package/core/class/card';
import { sendSelectedVisualEffect } from './_utils';
import { effectMove } from './move';
import { EffectHelper } from '../helper';

export function effectDelete(stack: Stack, source: Card, target: Card): void {
  const exists = target.owner.find(target);
  const isOnField =
    EffectHelper.isUnit(target) &&
    exists.result &&
    exists.place?.name === 'field' &&
    target.destination !== 'delete';
  if (!exists.result) return;

  switch (exists.place?.name) {
    case 'field': {
      // 既に消滅済みならばスキップ
      if (!isOnField) return;

      // 耐性持ちならばキャンセル
      if (target.hasKeyword('消滅効果耐性') && source.owner.id !== target.owner.id) {
        stack.core.room.soundEffect('block');
        return;
      }

      stack.addChildStack('delete', source, target);
      target.destination = 'delete';
      stack.core.room.soundEffect('bang');
      sendSelectedVisualEffect(stack, target);
      return;
    }

    default: {
      effectMove(stack, source, target, 'delete');
      return;
    }
  }
}
