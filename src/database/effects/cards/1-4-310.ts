import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■純真な心のままに
  // このユニットがフィールドに出た時、対戦相手のトリガーゾーンにあるカードを全て手札に戻す。
  // ■銀翼転身
  // このユニットが破壊された時、あなたのフィールドにユニットが4体以下の場合、対戦相手のコスト2以下のユニットを1体選ぶ。それをあなたのフィールドに【複製】する。

  // フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    // 相手のトリガーゾーンにカードがあるか確認
    if (opponent.trigger.length > 0) {
      await System.show(stack, '純真な心のままに', 'トリガーゾーンのカードを手札に戻す');

      // トリガーゾーンのカードを全て手札に戻す
      // 配列のコピーを作成して処理（元の配列が変更されるため）
      const triggerCards = [...opponent.trigger];

      for (const card of triggerCards) {
        Effect.move(stack, stack.processing, card, 'hand');
      }
    }
  },

  // 破壊された時の効果
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // フィールドのユニットが4体以下か確認
    if (owner.field.length <= 4) {
      // 相手のコスト2以下のユニットを取得
      const lowCostUnits = opponent.field.filter(unit => unit.catalog.cost <= 2);

      if (lowCostUnits.length > 0) {
        // 対象を選択可能なユニットを取得
        const targetCandidates = EffectHelper.candidate(
          stack.core,
          unit => unit.owner.id === opponent.id && unit.catalog.cost <= 2,
          owner
        );

        if (targetCandidates.length > 0) {
          await System.show(stack, '銀翼転身', 'ユニットを【複製】する');

          // ユニットを1体選択
          const [target] = await EffectHelper.selectUnit(
            stack,
            owner,
            targetCandidates,
            '【複製】するユニットを選択'
          );

          // 選択したユニットを複製
          await Effect.clone(stack, stack.processing, target, owner);
        }
      }
    }
  },
};
