import type { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    if (
      stack.core.players
        .flatMap(player => player.field)
        .some(unit => unit.id !== stack.processing.id)
    ) {
      await System.show(stack, '戦神の怒号', '自身以外の全てのユニットを破壊する');
      EffectHelper.exceptSelf(stack.core, stack.processing, unit =>
        Effect.break(stack, stack.processing, unit)
      );
    }
  },
};
