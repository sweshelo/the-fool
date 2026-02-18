import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(
      stack,
      '固着＆加護＆破壊効果耐性＆消滅効果耐性',
      '手札に戻らない\n効果に選ばれない\n効果によって破壊されない\n効果によって消滅しない'
    );
    Effect.keyword(stack, stack.processing, stack.processing, '固着');
    Effect.keyword(stack, stack.processing, stack.processing, '加護');
    Effect.keyword(stack, stack.processing, stack.processing, '破壊効果耐性');
    Effect.keyword(stack, stack.processing, stack.processing, '消滅効果耐性');
  },

  onBlock: async (stack: StackWithCard<Unit>) => {
    if (
      !stack.target ||
      !(stack.target instanceof Unit) ||
      stack.target.owner.id !== stack.processing.owner.id ||
      stack.target.id === stack.processing.id
    ) {
      return;
    }

    await System.show(stack, '安全+第一', 'BP+2000');
    Effect.modifyBP(stack, stack.processing, stack.target, 2000, {
      event: 'turnEnd',
      count: 1,
    });
  },
};
