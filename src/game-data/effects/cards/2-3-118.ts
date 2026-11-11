import type { Card } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Core } from '@/package/core';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  handEffect: (_core: Core, self: Card) => {
    PermanentEffect.mount(self, {
      effect: (target, source) =>
        Effect.dynamicCost(target, {
          source,
          calculator: () =>
            -[...self.owner.opponent.field, ...self.owner.field].filter(unit =>
              unit.hasKeyword('沈黙')
            ).length,
        }),
      effectCode: '腹から声を出せ！',
      targets: ['self'],
    });
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
