import { System, EffectTemplate } from '..';
import type { StackWithCard } from '../classes/types';

export const effects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'ドロー', 'カードを1枚引く');
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
