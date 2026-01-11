import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';

const effect = async (stack: StackWithCard, damage: number) => {
  await System.show(stack, '挑発', `${damage}ダメージ`);
  if (stack.target instanceof Unit) Effect.damage(stack, stack.processing, stack.target, damage);
};

export const effects: CardEffects = {
  checkAttack: stack => stack.source.id !== stack.processing.owner.id,
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
