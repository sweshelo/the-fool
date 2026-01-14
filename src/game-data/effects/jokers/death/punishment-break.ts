import { System } from '../../engine/system';
import { Effect } from '../../engine/effect';
import type { CardEffects, StackWithCard } from '../../schema/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    const opponent = player.opponent;
    return opponent.field.length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(stack, 'パニッシュメントブレイク', '敵全体に7000ダメージ');

    // 対戦相手の全てのユニットに7000ダメージを与える
    opponent.field.forEach(unit => {
      Effect.damage(stack, stack.processing, unit, 7000);
    });
  },
};
