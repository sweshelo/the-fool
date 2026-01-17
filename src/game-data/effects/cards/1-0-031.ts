import { EffectTemplate, System } from '..';
import type { StackWithCard } from '../schema/types';

export const effects = {
  onOverclockSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'リバイブ', '捨札から1枚選んで回収');
    await EffectTemplate.revive(stack, 1);
  },
};
