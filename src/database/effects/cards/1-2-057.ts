import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { EffectTemplate } from '../classes/templates';

export const effects: CardEffects = {
  checkBreak: stack =>
    stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id,
  onBreak: async (stack: StackWithCard) => {
    await System.show(stack, 'バックアップメンバー', 'ユニットカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['unit'] });
  },
};
