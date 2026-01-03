import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { EffectTemplate } from '../../classes/templates';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    return player.trash.length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    if (owner.trash.length === 0) return;

    await System.show(stack, 'フォースリベレーション', '捨札2枚回収\nカード2枚ドロー');

    // 捨札にあるカードを2枚ランダムで手札に加える
    const recoverCount = Math.min(2, owner.trash.length);
    const cardsToRecover = EffectHelper.random(owner.trash, recoverCount);

    cardsToRecover.forEach(card => {
      Effect.move(stack, stack.processing, card, 'hand');
    });

    // カードを2枚引く
    EffectTemplate.draw(owner, stack.core);
    EffectTemplate.draw(owner, stack.core);
  },
};
