import { System } from '../../engine/system';
import { EffectTemplate } from '../../engine/templates';
import type { CardEffects, StackWithCard } from '../../schema/types';

export const effects: CardEffects = {
  checkJoker: (_player, _core) => {
    return true;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    await System.show(stack, 'トリックフィンガー', 'カードを2枚引く');

    // カードを2枚引く
    EffectTemplate.draw(owner, stack.core);
    EffectTemplate.draw(owner, stack.core);
  },
};
