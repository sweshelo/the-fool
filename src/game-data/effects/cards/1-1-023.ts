import { Color } from '@/submodule/suit/constant/color';
import { System } from '../engine/system';
import { EffectTemplate } from '../engine/templates';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    return stack.processing.owner.id === stack.source.id;
  },

  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '紅蓮の魔導書', '赤属性カードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { color: Color.RED });
  },
};
