import { Unit } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'インターセプトドロー', 'インターセプトカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
  },
};
