import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';

export const effects: CardEffects = {
  onBreakSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.option?.type === 'break' && stack.option.cause === 'battle') {
      await System.show(stack, 'オーバーボルテックス', '紫ゲージ+1');
      await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
    }
  },
};
