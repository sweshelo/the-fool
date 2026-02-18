import type { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '不滅', 'ダメージを受けない');
    Effect.keyword(stack, stack.processing, stack.processing, '不滅');
  },

  onWinSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '任務完了', '自身を破壊');
    Effect.break(stack, stack.processing, stack.processing);
  },
};
