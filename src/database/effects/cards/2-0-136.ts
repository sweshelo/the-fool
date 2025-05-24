import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkBreak: (stack: StackWithCard) => {
    return stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id;
  },

  onBreak: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '玲瓏の鉱脈', 'CP+1');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, +1);
  },

  checkPlayerAttack: (stack: StackWithCard) => {
    return stack.source instanceof Unit && stack.processing.owner.id === stack.source.owner.id;
  },

  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '玲瓏の鉱脈', 'CP+2');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, +2);
  },

  checkTurnEnd: (stack: StackWithCard) => {
    return stack.processing.owner.id === stack.core.getTurnPlayer().id;
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '玲瓏の鉱脈', 'CP+4');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, +4);
  },
};
