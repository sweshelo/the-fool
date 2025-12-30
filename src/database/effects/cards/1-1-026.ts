import { Color } from '@/submodule/suit/constant/color';
import { System } from '../classes/system';
import { EffectTemplate } from '../classes/templates';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    return stack.processing.owner.id === stack.source.id;
  },

  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '深緑の魔導書', '緑属性カードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { color: Color.GREEN });
  },
};
