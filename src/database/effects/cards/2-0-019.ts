import { EffectTemplate, System, EffectHelper, Effect } from '..';
import type { StackWithCard } from '../classes/types';

export const effects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'チャージ＆ドロー', 'CP+1\nカードを1枚引く');
    const owner = EffectHelper.owner(stack.core, stack.processing);
    EffectTemplate.draw(owner, stack.core);
    Effect.modifyCP(stack, stack.processing, owner, 1);
  },
};
