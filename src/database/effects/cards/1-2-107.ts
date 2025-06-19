import type { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(
      stack,
      '加護＆沈黙効果耐性',
      '効果に選ばれない\n対戦相手の効果によって【沈黙】が付与されない'
    );
    Effect.keyword(stack, stack.processing, stack.processing as Unit, '加護');
    Effect.keyword(stack, stack.processing, stack.processing as Unit, '沈黙効果耐性');
  },
};
