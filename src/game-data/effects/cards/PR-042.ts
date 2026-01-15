import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■ウェイト・イリュージョン
  // このユニットがフィールドに出た時、対戦相手のコスト3以上の全てのユニットの行動権を消費する。
  async onDriveSelf(stack: StackWithCard<Unit>) {
    const opponent = stack.processing.owner.opponent;

    // 対戦相手のコスト3以上のユニットを取得
    const highCostUnits = opponent.field.filter(unit => unit.catalog.cost >= 3);

    if (highCostUnits.length > 0) {
      await System.show(stack, 'ウェイト・イリュージョン', 'コスト3以上のユニットの行動権を消費');

      // 行動権を消費
      for (const unit of highCostUnits) {
        Effect.activate(stack, stack.processing, unit, false);
      }
    }
  },
};
