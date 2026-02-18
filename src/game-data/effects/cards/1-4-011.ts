import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■転生の禁術
  // このユニットがフィールドに出た時、あなたの捨札にある消滅しているカードを1枚選ぶ。
  // それを手札に加える。

  // 召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 消滅しているカードは実際にはデータベース上で「delete」に分類されている
    const deletedCards = stack.processing.owner.delete;

    if (deletedCards.length > 0) {
      await System.show(stack, '転生の禁術', '消滅から1枚回収');

      // プレイヤーに消滅したカードを選ばせる
      const [selectedCard] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        deletedCards,
        '手札に加える消滅カードを選択'
      );

      // 選択したカードを手札に加える
      Effect.move(stack, stack.processing, selectedCard, 'hand');
    }
  },
};
