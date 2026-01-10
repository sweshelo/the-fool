import { System } from '../../classes/system';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    const opponent = player.opponent;
    return opponent.field.length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    if (opponent.field.length === 0) return;

    await System.show(stack, 'インペリアルクルセイド', '敵全体のユニットを破壊する');

    // 対戦相手の全てのユニットを破壊する
    [...opponent.field].forEach(unit => {
      Effect.break(stack, stack.processing, unit);
    });
  },
};
