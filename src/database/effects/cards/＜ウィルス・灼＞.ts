import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
    const isOpponentUnitAttacked = stack.source.id !== stack.processing.owner.id;
    const targets = stack.core.players.flatMap(player => player.field);

    if (isOpponentUnitAttacked && targets.length > 0) {
      await System.show(stack, '＜ウィルス・灼＞', '1000ダメージ');
      EffectHelper.exceptSelf(stack.core, stack.processing, unit =>
        Effect.damage(stack, stack.processing, unit, 1000, 'effect')
      );
    }
  },
};
