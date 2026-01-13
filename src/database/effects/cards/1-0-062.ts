import type { Card } from '@/package/core/class/card';
import { Unit } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // あなたのユニットがフィールドに出た時、あなたはカードを1枚引く。
  checkDrive: (stack: StackWithCard<Card>): boolean => {
    return stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '何でも屋の陳列台', 'カードを1枚引く');
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
