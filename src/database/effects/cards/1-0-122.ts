import { Unit } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '一筋の光明', 'カードを3枚引く');
    [...Array(3)].forEach(() => EffectTemplate.draw(stack.processing.owner, stack.core));
  },

  checkDrive: (stack: StackWithCard) => {
    return (
      stack.processing.owner.life.current <= 3 &&
      stack.target instanceof Unit &&
      stack.processing.owner.id === stack.target.owner.id
    );
  },
};
