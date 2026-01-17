import type { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'スピードムーブ', '行動制限の影響を受けない');
    Effect.speedMove(stack, stack.processing);
  },

  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.owner.opponent.field.length <= 0) return;
    await System.show(stack, 'ダメージブレイク', '敵全体に3000ダメージ');
    stack.processing.owner.opponent.field.forEach(unit =>
      Effect.damage(stack, stack.processing, unit, 3000)
    );
  },
};
