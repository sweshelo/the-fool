import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    return player.hand.length > 0 && player.deck.length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    if (owner.hand.length === 0 || owner.deck.length === 0) return;

    await System.show(stack, 'エビルガンビット', '手札1枚捨てる\nデッキから選んで手札に加える');

    // 手札を1枚選んで捨てる
    const [discardCard] = await EffectHelper.selectCard(
      stack,
      owner,
      owner.hand,
      '捨てるカードを選択'
    );

    Effect.handes(stack, stack.processing, discardCard);

    // デッキからカードを1枚選んで手札に加える
    const [selectedCard] = await EffectHelper.selectCard(
      stack,
      owner,
      owner.deck,
      'デッキから手札に加えるカードを選択'
    );

    Effect.move(stack, stack.processing, selectedCard, 'hand');
  },
};
