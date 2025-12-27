import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onTurnEnd: async (stack: StackWithCard<Unit>) => {
    if (
      stack.processing.owner.field.length <= 4 &&
      stack.processing.owner.id === stack.core.getTurnPlayer().id
    ) {
      await System.show(stack, 'ジゴック増殖大作戦', '自身を【複製】');
      await Effect.clone(stack, stack.processing, stack.processing, stack.processing.owner);
    }
  },
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '加護', '効果に選ばれない');
    Effect.keyword(stack, stack.processing, stack.processing, '加護');
  },
};
