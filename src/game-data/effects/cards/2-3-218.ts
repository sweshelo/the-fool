import type { Card, Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Core } from '@/package/core/core';
import { Delta } from '@/package/core/class/delta';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';

export const effects: CardEffects = {
  handEffect: (core: Core, self: Card) => {
    const targetDelta = self.delta.find(delta => delta.source?.unit === self.id);
    if (targetDelta && targetDelta.effect.type === 'cost') {
      targetDelta.effect.value = core.round;
    } else {
      self.delta.push(
        new Delta(
          { type: 'cost', value: core.round },
          {
            source: {
              unit: self.id,
            },
          }
        )
      );
    }
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    const targetDelta = stack.processing.delta.find(
      delta => delta.source?.unit === stack.processing.id
    );
    if (targetDelta && targetDelta.effect.type === 'bp') {
      targetDelta.effect.diff = stack.core.round * 1000;
    } else {
      Effect.modifyBP(stack, stack.processing, stack.processing, stack.core.round * 1000, {
        source: { unit: stack.processing.id },
      });
    }
  },

  onDriveSelf: async (stack: StackWithCard) => {
    const targets = stack.processing.owner.opponent.field.filter(
      unit => unit.currentBP <= stack.core.round * 1000
    );
    await System.show(
      stack,
      `${targets.length > 0 ? 'クロノステイシス＆' : ''}タイムパラドックス`,
      `${targets.length > 0 ? '敵全体のBP[ラウンド数×1000]以下を破壊\n' : ''}BP+[ラウンド数×1000]`
    );

    targets.forEach(unit => Effect.break(stack, stack.processing, unit, 'effect'));
  },
};
