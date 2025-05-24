import { Evolve, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■インキュベーション
  // あなたの【昆虫】ユニットがフィールドに出た時、それを破壊する。そうした場合、あなたのフィールドのユニットが4体以下の場合、
  // あなたのデッキから進化ユニット以外の［破壊したユニットのコスト+1］のコストの【昆虫】ユニットをランダムで1体【特殊召喚】する。

  // インターセプトが発動可能かどうかをチェック
  checkDrive: (stack: StackWithCard): boolean => {
    // 自分の昆虫ユニットがフィールドに出た時に発動
    if (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.target.catalog.species?.includes('昆虫') &&
      stack.type === 'drive'
    ) {
      return true;
    }
    return false;
  },

  // 効果の実行
  onDrive: async (stack: StackWithCard): Promise<void> => {
    // 処理中のユニットは昆虫であることが確認済み
    if (stack.target instanceof Unit) {
      // 昆虫ユニットのコストを保存しておく
      const costOfDestroyed = stack.target.catalog.cost;

      // 昆虫ユニットを破壊
      await System.show(
        stack,
        'インキュベーション',
        `フィールドに出たを破壊\nユニットを【特殊召喚】`
      );
      Effect.break(stack, stack.processing, stack.target, 'effect');

      // フィールドのユニット数が4体以下なら特殊召喚を試みる
      if (stack.processing.owner.field.length <= 4) {
        // デッキから条件に合うユニットを検索
        const targetCost = costOfDestroyed + 1;
        const candidates = stack.processing.owner.deck.filter(
          card =>
            card instanceof Unit &&
            !(card instanceof Evolve) && // 進化ユニット以外
            card.catalog.species?.includes('昆虫') && // 昆虫ユニット
            card.catalog.cost === targetCost // コストは(破壊したユニットのコスト+1)
        ) as Unit[];

        if (candidates.length > 0) {
          // ランダムで1体選んで特殊召喚
          const selectedUnits = EffectHelper.random(candidates, 1);
          if (selectedUnits.length > 0) {
            const selectedUnit = selectedUnits[0] as Unit;
            await Effect.summon(stack, stack.processing, selectedUnit);
          }
        }
      }
    }
  },
};
