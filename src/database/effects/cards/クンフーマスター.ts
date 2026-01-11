import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';
import { EffectTemplate } from '../classes/templates';

export const effects: CardEffects = {
  onBreakSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.option?.type === 'break' && stack.option.cause === 'battle') {
      await System.show(stack, '技の伝授', 'CP+1\nカードを1枚引く');
      Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
      EffectTemplate.draw(stack.processing.owner, stack.core);
    }
  },
};
