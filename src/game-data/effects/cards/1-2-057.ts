import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { EffectTemplate } from '../engine/templates';

export const effects: CardEffects = {
  checkBreak: stack =>
    stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id,
  onBreak: async (stack: StackWithCard) => {
    await System.show(stack, 'バックアップメンバー', 'ユニットカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, {
      type: ['unit', 'advanced_unit'],
    });
  },
};
