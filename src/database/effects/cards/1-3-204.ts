import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';

export const effects: CardEffects = {
  onDrive: async (stack: StackWithCard<Unit>) => {
    if (
      stack.source.id !== stack.processing.owner.id ||
      !(stack.target instanceof Unit) ||
      stack.processing.id === stack.target.id ||
      stack.processing.owner.id !== stack.target.owner.id ||
      !stack.target.catalog.species?.includes('忍者')
    )
      return;
    await System.show(stack, '艶忍の瞬動術', '【スピードムーブ】を付与\n自身を破壊');
    Effect.speedMove(stack, stack.target);
    Effect.break(stack, stack.processing, stack.processing);
  },
};
