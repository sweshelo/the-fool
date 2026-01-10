import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return player.trash.length > 0 && player.hand.length < core.room.rule.player.max.hand;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    if (owner.trash.length === 0) return;

    await System.show(stack, '冥札再臨', '捨札から1枚回収');

    // 捨札にあるカードを1枚選んで手札に加える
    const [card] = await EffectHelper.selectCard(
      stack,
      owner,
      owner.trash,
      '手札に加えるカードを選択'
    );

    // 手札に加える
    Effect.move(stack, stack.processing, card, 'hand');
  },
};
