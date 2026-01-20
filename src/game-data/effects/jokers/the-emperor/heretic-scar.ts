import { System } from '../../engine/system';
import { Effect } from '../../engine/effect';
import type { CardEffects, StackWithCard } from '../../schema/types';

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
