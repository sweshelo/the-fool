import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '学んだ和心', '行動権を消費\n紫ゲージ+2');
    Effect.activate(stack, stack.processing, stack.processing, false);
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 2);
  },

  // ブロック時効果
  onBlockSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'ブロッカー', 'BP+2000');
    Effect.modifyBP(stack, stack.processing, stack.processing, 2000, {
      event: 'turnEnd',
      count: 1,
    });
  },
};
