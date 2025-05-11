import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // ■チャージ
  // このユニットがフィールドに出た時、あなたのCPを+2する。
  // ■連撃・グラインドドロー
  // このユニットがフィールドに出た時、このターンにあなたがこのユニット以外のコスト2以上の緑属性のカードを使用している場合、
  // あなたはカードを1枚引く。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 連撃条件確認: このターンにコスト2以上の緑属性のカードを使用しているか
    const hasUsedGreenCardThisTurn = stack.core.histories.some(
      history =>
        history.card.id !== stack.processing.id && // このユニット以外
        history.card.catalog.color === Color.GREEN && // 緑属性
        history.card.catalog.cost >= 2 // コスト2以上
    );

    if (hasUsedGreenCardThisTurn) {
      // 両方の効果が発動できる場合
      await System.show(stack, 'チャージ＆グラインドドロー', 'CP+2\nカードを1枚引く');

      // CPを+2する
      Effect.modifyCP(stack, stack.processing, stack.processing.owner, 2);

      // カードを1枚引く
      EffectTemplate.draw(stack.processing.owner, stack.core);
    } else {
      // チャージ効果のみ発動
      await System.show(stack, 'チャージ', 'CP+2');

      // CPを+2する
      Effect.modifyCP(stack, stack.processing, stack.processing.owner, 2);
    }
  },
};
