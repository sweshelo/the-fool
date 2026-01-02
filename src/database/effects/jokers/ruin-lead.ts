import { System } from '../classes/system';
import { EffectHelper } from '../classes/helper';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Card } from '@/package/core/class/card/Card';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    // Check if player has at least 2 cards in hand
    return player.hand.length >= 2;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'ルインリード', '手札を2枚捨てる\nカードを3枚引く');

    const player = stack.processing.owner;

    // Prompt player to select 2 cards from hand to discard
    const selectedCards = await EffectHelper.selectCard(
      stack,
      player,
      player.hand,
      '捨てるカードを2枚選んでください',
      2
    );

    if (selectedCards.length === 2) {
      // Discard selected cards to trash
      selectedCards.forEach((card: Card) => {
        player.hand = player.hand.filter(c => c.id !== card.id);
        player.trash.push(card);
      });

      // Draw 3 cards from deck
      for (let i = 0; i < 3; i++) {
        const card = player.deck.shift();
        if (card) {
          player.hand.push(card);
        }
      }
    }
  },
};
