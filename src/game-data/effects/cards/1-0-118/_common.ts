import { System } from '@/game-data/effects/engine/system';
import { EffectTemplate } from '@/game-data/effects/engine/templates';
import type { StackWithCard } from '@/game-data/effects/schema/types';

const effect = async (stack: StackWithCard): Promise<void> => {
  await System.show(stack, '意気投合', 'お互いにカードを2枚引く');
  stack.core.players.forEach(player => {
    [...Array(2)].forEach(() => EffectTemplate.draw(player, stack.core));
  });
};

export { effect };
