import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard): boolean => {
    return stack.processing.owner.id === stack.source.id;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '求愛のダンス', 'トリガーカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['trigger'] });
  },
};
