import { System } from '../../classes/system';
import { EffectTemplate } from '../../classes/templates';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (_player, _core) => {
    return true;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(stack, 'ティンクル×リンク', 'お互い手札5枚までドロー');

    // お互いのプレイヤーは手札が5枚になるようにカードを引く
    [owner, opponent].forEach(player => {
      if (player.hand.length < 5) {
        const drawCount = 5 - player.hand.length;
        for (let i = 0; i < drawCount; i++) {
          EffectTemplate.draw(player, stack.core);
        }
      }
    });
  },
};
