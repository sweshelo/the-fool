import { EffectTemplate, System } from '..';
import type { StackWithCard } from '../classes/types';

export const effects = {
  onOverclockSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'この指とーまれい', '【珍獣】ユニットを2枚引く');
    [...Array(2)].forEach(() =>
      EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '珍獣' })
    );
  },
};
