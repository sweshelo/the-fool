import type { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import { EffectTemplate } from '../engine/templates';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, '援軍／忍者', '【忍者】を1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '忍者' });
  },

  onBattleSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '忍法・雪遁の術', '自身を【複製】し【沈黙】を付与\n自身を破壊');
    const clone = await Effect.clone(
      stack,
      stack.processing,
      stack.processing,
      stack.processing.owner
    );

    if (clone) Effect.keyword(stack, stack.processing, clone, '沈黙');
    Effect.break(stack, stack.processing, stack.processing);
  },
};
