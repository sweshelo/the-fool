import { System } from '../../engine/system';
import { Effect } from '../../engine/effect';
import type { CardEffects, StackWithCard } from '../../schema/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    return player.field.length > 0 || player.opponent.field.length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(stack, '飛龍乗雲の拳', '【貫通】付与\n敵全体の基本BP-5000');

    // 自分の全てのユニットに【貫通】を与える
    owner.field.forEach(unit => {
      Effect.keyword(stack, stack.processing, unit, '貫通');
    });

    // 対戦相手の全てのユニットの基本BPを-5000する
    opponent.field.forEach(unit => {
      Effect.modifyBP(stack, stack.processing, unit, -5000, { isBaseBP: true });
    });
  },
};
