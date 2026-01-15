import { System } from '../../engine/system';
import { EffectHelper } from '../../engine/helper';
import { Effect } from '../../engine/effect';
import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../../schema/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    return player.hand.length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    if (owner.hand.length === 0) return;

    await System.show(stack, 'アナザー×バイザー', '手札にあるカードのレベル+2');

    // 手札にあるカードを1枚選ぶ
    const [selectedCard] = await EffectHelper.selectCard(
      stack,
      owner,
      owner.hand,
      'レベルを上げるカードを選択'
    );

    // レベルを+2する
    if (selectedCard instanceof Unit) {
      Effect.clock(stack, stack.processing, selectedCard, 2);
    }
  },
};
