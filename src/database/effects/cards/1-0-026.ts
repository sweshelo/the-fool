import type { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import { EffectHelper } from '../classes/helper';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

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
