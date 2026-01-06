import type { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '不滅', 'ダメージを受けない');
    Effect.keyword(stack, stack.processing, stack.processing, '不滅');
  },

  onTurnEnd: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.owner.id === stack.source.id) return;

    await System.show(stack, '孤独の果てに', '自身を消滅');
    Effect.delete(stack, stack.processing, stack.processing);
  },
};
