import { System } from '../../classes/system';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (_player, _core) => {
    return true;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(stack, 'ヘレティックスカー', '2ライフダメージ');

    // 対戦相手に2ライフダメージを与える
    Effect.modifyLife(stack, stack.processing, opponent, -2);
  },
};
