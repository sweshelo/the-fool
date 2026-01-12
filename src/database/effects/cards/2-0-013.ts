import type { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

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
