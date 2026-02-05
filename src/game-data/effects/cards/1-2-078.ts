import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';

const effect = async (stack: StackWithCard, damage: number) => {
  await System.show(stack, '挑発', `${damage}ダメージ`);
  if (stack.target instanceof Unit) Effect.damage(stack, stack.processing, stack.target, damage);
};

export const effects: CardEffects = {
  checkAttack: (stack: StackWithCard) => {
    return (
      stack.source.id !== stack.processing.owner.id &&
      stack.processing.owner.opponent.field.some(unit => unit.id === stack.target?.id)
    );
  },

  onAttack: async (stack: StackWithCard) => {
    switch (stack.processing.lv) {
      case 1: {
        await effect(stack, 3000);
        break;
      }
      case 2: {
        await effect(stack, 5000);
        break;
      }
      case 3: {
        await effect(stack, 7000);
        break;
      }
    }
  },
};
