import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { EffectHelper } from '../engine/helper';
import { Effect } from '../engine/effect';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const targets = stack.core.players
      .flatMap(player => player.field)
      .filter(unit => unit.id !== stack.processing.id);
    const totalLifeDamage = stack.core.players.reduce((sum, player) => {
      return sum + (player.life.max - player.life.current);
    }, 0);
    if (targets.length > 0 && totalLifeDamage > 0) {
      await System.show(stack, '魔香の愛', `2000ダメージ×[お互いのライフダメージ]`);
      EffectHelper.repeat(totalLifeDamage, () =>
        EffectHelper.random(targets).forEach(unit =>
          Effect.damage(stack, stack.processing, unit, 2000)
        )
      );
    }
  },
};
