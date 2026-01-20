import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (
      stack.processing.owner.field.length > 1 ||
      stack.processing.owner.opponent.field.length > 0
    ) {
      const damage = stack.processing.owner.opponent.field.length >= 3 ? 5 : 3;
      await System.show(
        stack,
        '断罪の大鎌',
        `自身以外の全てのユニットを消滅\n${damage}ライフダメージ`
      );
      EffectHelper.exceptSelf(stack.core, stack.processing, unit =>
        Effect.delete(stack, stack.processing, unit)
      );
      [...Array(damage)].forEach(() => stack.processing.owner.damage(true));
    }
  },
};
