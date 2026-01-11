import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { EffectHelper } from '../classes/helper';
import { Effect } from '../classes/effect';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const targets = stack.core.players
      .flatMap(player => player.field)
      .filter(unit => unit.id !== stack.processing.id);
    if (targets.length > 0) {
      await System.show(stack, '魔香の愛', `2000ダメージ×[お互いのライフダメージ]`);
      const totalLifeDamage = stack.core.players.reduce((sum, player) => {
        return sum + (player.life.max - player.life.current);
      }, 0);
      EffectHelper.repeat(totalLifeDamage, () =>
        EffectHelper.random(targets).forEach(unit =>
          Effect.damage(stack, stack.processing, unit, 2000)
        )
      );
    }
  },
};
