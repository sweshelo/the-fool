import { System } from '../../classes/system';
import { Effect } from '../../classes/effect';
import { EffectHelper } from '../../classes/helper';
import { EffectTemplate } from '../../classes/templates';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return (
      player.hand.length < core.room.rule.player.max.hand || player.opponent.trigger.length > 0
    );
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(
      stack,
      'カーニバルドミネイト',
      'トリガーゾーンのカードを2枚まで破壊\nカードを2枚引く'
    );

    EffectHelper.random(opponent.trigger, 2).forEach(card =>
      Effect.move(stack, stack.processing, card, 'trash')
    );
    EffectHelper.repeat(2, () => EffectTemplate.draw(owner, stack.core));
  },
};
