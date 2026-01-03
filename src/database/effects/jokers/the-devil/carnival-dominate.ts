import { System } from '../../classes/system';
import { Effect } from '../../classes/effect';
import { EffectHelper } from '../../classes/helper';
import { EffectTemplate } from '../../classes/templates';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (_player, _core) => {
    return true;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(stack, 'カーニバルドミネイト', 'トリガー2枚破壊\nカード2枚ドロー');

    // 対戦相手のトリガーゾーンにあるカードを2枚までランダムで破壊する
    if (opponent.trigger.length > 0) {
      const destroyCount = Math.min(2, opponent.trigger.length);
      const targets = EffectHelper.random(opponent.trigger, destroyCount);

      targets.forEach(card => {
        Effect.handes(stack, stack.processing, card);
      });
    }

    // カードを2枚引く
    EffectTemplate.draw(owner, stack.core);
    EffectTemplate.draw(owner, stack.core);
  },
};
