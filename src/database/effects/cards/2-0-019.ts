import { EffectTemplate, System, Effect } from '..';
import type { StackWithCard } from '../classes/types';

export const effects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'チャージ＆ドロー', 'CP+1\nカードを1枚引く');
    const owner = stack.processing.owner;
    EffectTemplate.draw(owner, stack.core);
    Effect.modifyCP(stack, stack.processing, owner, 1);
  },
};
