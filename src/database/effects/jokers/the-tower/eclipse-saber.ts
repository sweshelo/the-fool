import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    // 捨札にカードが存在するか確認
    // Note: 消滅カードの追跡機能は現在実装されていないため、通常の捨札回収として実装
    return player.delete.length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    if (owner.delete.length === 0) return;

    await System.show(stack, '秘技・エクリプスセイバー', '消滅カードを1枚回収');

    // 捨札からカードを1枚選んで手札に加える
    const [selectedCard] = await EffectHelper.selectCard(
      stack,
      owner,
      owner.delete,
      '手札に加えるカードを選択'
    );

    Effect.move(stack, stack.processing, selectedCard, 'hand');
  },
};
