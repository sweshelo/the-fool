import type { Stack } from '@/package/core/class/stack';
import { EffectTemplate, System, EffectHelper } from '..';

export const effects = {
  checkDrive: (stack: Stack) => {
    // Make sure processing is defined
    if (!stack.processing) throw new Error('Stack processing is undefined');

    return (
      EffectHelper.owner(stack.core, stack.source).id ===
      EffectHelper.owner(stack.core, stack.processing).id
    );
  },
  onDrive: async (stack: Stack) => {
    // Make sure processing is defined
    if (!stack.processing) throw new Error('Stack processing is undefined');

    const owner = EffectHelper.owner(stack.core, stack.processing);
    if (owner.deck.length >= 2) {
      await System.show(stack, '最後の一葉', 'カードを1枚引く');
      EffectTemplate.draw(owner, stack.core);
    } else {
      await System.show(stack, '最後の一葉', 'カードを2枚引く');
      [...Array(2)].forEach(() => EffectTemplate.draw(owner, stack.core));
    }
  },
};
