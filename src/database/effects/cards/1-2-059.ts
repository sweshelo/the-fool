import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■生産工場
  // あなたのユニットがフィールドに出た時、【昆虫】ユニットのカードを1枚ランダムで手札に加える。
  // あなたの【昆虫】ユニットが破壊された時、あなたのデッキにある【昆虫】ユニットのカードのうち、
  // 属性の異なるカードを2枚までランダムで手札に加える。

  // ユニット召喚時
  onDrive: async (stack: StackWithCard): Promise<void> => {
    // 自分のユニットが召喚された時
    if (stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id) {
      // デッキから昆虫ユニットを検索
      const insectUnits = stack.processing.owner.deck.filter(
        card => card instanceof Unit && card.catalog.species?.includes('昆虫')
      );

      if (insectUnits.length > 0) {
        await System.show(stack, '生産工場', '【昆虫】ユニットを1枚手札に加える');

        // ランダムで1枚選択
        const selectedUnits = EffectHelper.random(insectUnits, 1);
        // TypeScriptのUndefined対策
        for (const card of selectedUnits) {
          Effect.move(stack, stack.processing, card, 'hand');
          break; // 1枚だけ追加
        }
      }
    }
  },

  // ユニット破壊時
  onBreak: async (stack: StackWithCard): Promise<void> => {
    // 自分の昆虫ユニットが破壊された時
    if (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.target.catalog.species?.includes('昆虫')
    ) {
      // 破壊されたユニットの色を保存
      const destroyedColor = stack.target.catalog.color;

      // デッキから異なる属性の昆虫ユニットを検索
      const differentColorInsects = stack.processing.owner.deck.filter(
        card =>
          card instanceof Unit &&
          card.catalog.species?.includes('昆虫') &&
          card.catalog.color !== destroyedColor // 破壊されたユニットとは異なる色
      );

      if (differentColorInsects.length > 0) {
        await System.show(stack, '生産工場', '異なる属性の【昆虫】ユニットを2枚まで手札に加える');

        // ランダムで最大2枚選択
        const selectedCards = EffectHelper.random(
          differentColorInsects,
          Math.min(2, differentColorInsects.length)
        );

        // 手札に加える
        // TypeScriptのUndefined対策: 配列から直接要素にアクセスするのではなく、forループで処理
        for (const card of selectedCards) {
          Effect.move(stack, stack.processing, card, 'hand');
        }
      }
    }
  },
};
