import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 時流の審理 - フィールドに出た時
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await destroySilencedUnit(stack);
  },

  // 時流の審理 - 破壊された時
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await destroySilencedUnit(stack);
  },

  // 輪廻転書 - ターン終了時
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    // 自分のターン終了時のみ発動
    if (owner.id === stack.core.getTurnPlayer().id) {
      // 消滅しているカードがあるか確認
      if (owner.delete_selectable) {
        await System.show(stack, '輪廻転書', '消滅しているカードを捨札に送る');

        // ランダムで1枚選ぶ
        const [cardToMove] = EffectHelper.random(owner.delete, 1);

        if (cardToMove) {
          // 捨札に送る
          Effect.move(stack, stack.processing, cardToMove, 'trash');
        }
      }
    }
  },
};

// 【沈黙】効果を持つ対戦相手のユニットを選んで破壊する共通ロジック
async function destroySilencedUnit(stack: StackWithCard<Unit>): Promise<void> {
  // 対戦相手の【沈黙】状態のユニットを取得
  const silencedUnitsFilter = (unit: Unit) =>
    unit.owner.id !== stack.processing.owner.id && unit.hasKeyword('沈黙');
  const silencedUnits_selectable = EffectHelper.isUnitSelectable(
    stack.core,
    silencedUnitsFilter,
    stack.processing.owner
  );

  if (silencedUnits_selectable) {
    await System.show(stack, '時流の審理', '【沈黙】を持つユニットを破壊');

    // ユニット選択
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      silencedUnitsFilter,
      '破壊するユニットを選択してください'
    );

    // 破壊する
    Effect.break(stack, stack.processing, target);
  }
}
