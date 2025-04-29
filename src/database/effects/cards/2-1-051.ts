import type { Stack } from '@/package/core/class/stack';
import { EffectTemplate, System } from '..';
import { Card } from '@/package/core/class/card';
import type { StackWithCard } from '../classes/types';

export const effects = {
  checkDrive: (stack: StackWithCard) => {
    if (!(stack.target instanceof Card)) return false;
    return stack.target.owner.id === stack.processing.owner.id;
  },
  onDrive: async (stack: Stack) => {
    // Make sure processing is defined
    if (!stack.processing) throw new Error('Stack processing is undefined');

    const owner = stack.processing.owner;
    if (owner.deck.length >= 2) {
      await System.show(stack, '最後の一葉', 'カードを1枚引く');
      EffectTemplate.draw(owner, stack.core);
    } else {
      await System.show(stack, '最後の一葉', 'カードを2枚引く');
      [...Array(2)].forEach(() => EffectTemplate.draw(owner, stack.core));
    }
  },
};
