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

    await System.show(stack, 'パニッシュメントブレイク', '全体に7000ダメージ');

    // 対戦相手の全てのユニットに7000ダメージを与える
    opponent.field.forEach(unit => {
      Effect.damage(stack, stack.processing, unit, 7000);
    });
  },
};
