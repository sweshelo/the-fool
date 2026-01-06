import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■永縛の神威
  // 対戦相手のターン開始時、対戦相手のコスト3以上の全てのユニットの行動権を消費する。
  // あなたのターン開始時、対戦相手の行動済ユニットを1体選ぶ。それを消滅させる。
  // このユニットがオーバークロックした時、対戦相手の全てのユニットの行動権を消費する。

  // ターン開始時効果
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    const turnPlayer = stack.core.getTurnPlayer();
    const isOpponentsTurn = turnPlayer.id === stack.processing.owner.opponent.id;
    const isPlayersTurn = turnPlayer.id === stack.processing.owner.id;

    // 対戦相手のターン開始時効果
    if (isOpponentsTurn) {
      // コスト3以上の対戦相手のユニットを検索
      const highCostUnits = stack.processing.owner.opponent.field.filter(
        unit => unit.catalog.cost >= 3
      );

      if (highCostUnits.length > 0) {
        await System.show(stack, '永縛の神威', 'コスト3以上の全ユニットの行動権を消費');

        // 行動権を消費
        for (const unit of highCostUnits) {
          Effect.activate(stack, stack.processing, unit, false);
        }
      }
    }
    // 自分のターン開始時効果
    else if (isPlayersTurn) {
      // 対戦相手の行動済みユニットを検索
      const filter = (unit: Unit) =>
        unit.owner.id === stack.processing.owner.opponent.id && !unit.active;

      if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
        await System.show(stack, '永縛の神威', '行動済ユニットを1体消滅');

        // 対象を1体選択
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          '消滅させる行動済ユニットを選択'
        );

        // 選択したユニットを消滅
        Effect.delete(stack, stack.processing, target);
      }
    }
  },

  // オーバークロック時効果
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対戦相手のユニットを全て取得
    const opponentUnits = stack.processing.owner.opponent.field;

    if (opponentUnits.length > 0) {
      await System.show(stack, '永縛の神威', '対戦相手の全ユニットの行動権を消費');

      // 全ユニットの行動権を消費
      for (const unit of opponentUnits) {
        Effect.activate(stack, stack.processing, unit, false);
      }
    }
  },
};
