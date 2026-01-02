import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    return player.hand.length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    if (owner.hand.length === 0) return;

    await System.show(stack, 'アナザー×バイザー', '手札レベル+2');

    // 手札にあるカードを1枚選ぶ
    const [selectedCard] = await EffectHelper.selectCard(
      stack,
      owner,
      owner.hand,
      'レベルを上げるカードを選択'
    );

    // レベルを+2する
    // Note: 手札のカードのレベルを変更する機能は現在実装されていません
    // 代わりにclockを使用しますが、これはユニットのみに有効です
    if (selectedCard instanceof Unit) {
      Effect.clock(stack, stack.processing, selectedCard, 2);
    }
  },
};
