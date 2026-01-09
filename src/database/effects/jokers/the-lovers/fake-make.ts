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

    await System.show(stack, 'フェイク×メイク', '手札を1枚作成');

    // 手札を1枚選ぶ
    const [selectedCard] = await EffectHelper.selectCard(
      stack,
      owner,
      owner.hand,
      'コピーするカードを選択'
    );

    // 選んだカードを手札に作成する（コピー）
    // Note: cloneはフィールド上のユニットのみに対応しているため、手札のカードには使用不可
    // ユニットカードの場合のみcloneを試みる
    if (selectedCard instanceof Unit) {
      await Effect.clone(stack, stack.processing, selectedCard, owner);
    }
  },
};
