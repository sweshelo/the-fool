import type { Card } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Core } from '@/package/core';
import { Delta } from '@/package/core/class/delta';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';

export const effects: CardEffects = {
  handEffect: (_core: Core, self: Card) => {
    const targetDelta = self.delta.find(delta => delta.source?.unit === self.id);
    const silencedUnits = [...self.owner.opponent.field, ...self.owner.field].filter(unit =>
      unit.hasKeyword('沈黙')
    ).length;

    if (targetDelta && targetDelta.effect.type === 'cost') {
      targetDelta.effect.value = Math.max(-silencedUnits, -4);
    } else {
      self.delta.push(
        new Delta(
          {
            type: 'cost',
            value: Math.max(-silencedUnits, -4),
          },
          { source: { unit: self.id } }
        )
      );
    }
  },

  onDriveSelf: async (stack: StackWithCard) => {
    const targets = [
      ...stack.processing.owner.field,
      ...stack.processing.owner.opponent.field,
    ].filter(unit => unit.hasKeyword('沈黙'));

    if (targets.length > 0) {
      await System.show(stack, '腹から声を出せ！', '【沈黙】を発動しているユニットを破壊');
      targets.forEach(unit => Effect.break(stack, stack.processing, unit, 'effect'));
    }
  },
};
