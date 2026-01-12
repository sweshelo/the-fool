import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import type { CardEffects, StackWithCard } from '../../classes/types';
import { Effect } from '../../classes/effect';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return player.hand.length > 0 && player.hand.length < core.room.rule.player.max.hand;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    if (owner.hand.length === 0) return;

    await System.show(stack, 'フェイク×メイク', '手札を1枚作成');

    // 手札を1枚選ぶ
    const [selectedCard] = await EffectHelper.selectCard(
      stack,
      owner,
      owner.hand,
      'コピーするカードを選択'
    );

    // 選んだカードを手札に作成する（コピー）
    Effect.make(stack, stack.processing.owner, selectedCard);
  },
};
