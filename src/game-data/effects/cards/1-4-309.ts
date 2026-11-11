import { Effect } from '@/game-data/effects/engine/effect';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  fieldEffect: stack => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.modifyBP(stack, stack.processing, target, 1000, { source });
      },
      effectCode: 'サポーター／道化師',
      condition: target => target.catalog.species?.includes('道化師'),
      targets: ['owns'],
    });
  },
  onPlayerAttack: async (stack: StackWithCard) => {
    if (
      !(stack.source instanceof Unit) ||
      stack.source.owner.id === stack.processing.owner.id ||
      stack.processing.owner.field.length > 4
    )
      return;
    await System.show(stack, '白き誓約', 'ユニットを【複製】');
    await Effect.clone(stack, stack.processing, stack.source, stack.processing.owner);
  },
};
