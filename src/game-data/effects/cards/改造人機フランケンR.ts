import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';

export const effects: CardEffects = {
  onBreakSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.option?.type === 'break' && stack.option.cause === 'battle') {
      await System.show(stack, 'オーバーボルテックス', '紫ゲージ+1');
      await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
    }
  },
};
