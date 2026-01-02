import { System } from '../../classes/system';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    const opponent = player.opponent;
    // トリガーゾーンにカードが存在するか確認
    return opponent.trigger.length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    if (opponent.trigger.length === 0) return;

    await System.show(stack, 'スターインパクト', 'トリガーデッキ戻し');

    // 対戦相手のトリガーゾーンにある全てのカードをデッキに戻す
    [...opponent.trigger].forEach(card => {
      Effect.move(stack, stack.processing, card, 'deck');
    });
  },
};
