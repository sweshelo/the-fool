import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';
import { EffectTemplate } from '../engine/templates';

export const effects: CardEffects = {
  onBreakSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.option?.type === 'break' && stack.option.cause === 'battle') {
      await System.show(stack, '技の伝授', 'CP+1\nカードを1枚引く');
      Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
      EffectTemplate.draw(stack.processing.owner, stack.core);
    }
  },
};
