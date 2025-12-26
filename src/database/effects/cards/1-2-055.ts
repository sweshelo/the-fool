import type { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

const gloomForest = async (stack: StackWithCard) => {
  await System.show(stack, '妖霧の森', 'CP-2');
  Effect.modifyCP(stack, stack.processing, stack.processing.owner, -2);
};

export const effects: CardEffects = {
  onDriveSelf: gloomForest,
  onDrive: async (stack: StackWithCard<Unit>) => {
    if (stack.target?.id !== stack.processing.id) gloomForest(stack);
  },

  onTurnStart: async (stack: StackWithCard) => {
    await System.show(stack, '輝きの泉', 'CP+1');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
    Effect.modifyCP(stack, stack.processing, stack.processing.owner.opponent, 1);
  },
};
