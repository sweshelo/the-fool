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

    await System.show(stack, 'サイレンスビロウ', '敵全体に【沈黙】を付与\n基本BP-2000');

    // 対戦相手の全てのユニットに【沈黙】を与え、基本BPを-2000する
    opponent.field.forEach(unit => {
      Effect.keyword(stack, stack.processing, unit, '沈黙');
      Effect.modifyBP(stack, stack.processing, unit, -2000, { isBaseBP: true });
    });
  },
};
