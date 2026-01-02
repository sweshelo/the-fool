import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import type { CardEffects, StackWithCard } from '../../classes/types';
import type { Card } from '@/package/core/class/card/Card';
import { Effect } from '../../classes/effect';
import { EffectTemplate } from '../../classes/templates';

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

    selectedCards.forEach((card: Card) => Effect.handes(stack, stack.processing, card));
    EffectHelper.repeat(2, () => EffectTemplate.draw(stack.processing.owner, stack.core));
  },
};
