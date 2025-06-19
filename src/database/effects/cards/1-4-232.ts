import type { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '封神太極陣＆固着', 'BP+1000\n手札に戻らない');
    Effect.keyword(stack, stack.processing, stack.processing as Unit, '固着');
  },

  onOverclockSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '討神義牙', '【貫通】を得る');
    Effect.keyword(stack, stack.processing, stack.processing as Unit, '貫通');
  },

  onPlayerAttackSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '脈打つ魂魄', 'CP+1');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
  },
};
