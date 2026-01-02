import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■天変雷舞・威神電震
  // このユニットがフィールドに出た時、全てのコスト2以下のユニットを消滅させる。
  // このユニットがアタックした時、対戦相手の全ての行動済ユニットに5000ダメージを与える。
  // 対戦相手のターン時、効果によってこのユニットが破壊された時、対戦相手のユニットを1体選ぶ。
  // それの行動権を消費する。

  // 召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 全プレイヤーのコスト2以下のユニットを検索
    const lowCostUnits = stack.core.players
      .map(player => player.field)
      .flat()
      .filter(unit => unit.catalog.cost <= 2);

    if (lowCostUnits.length > 0) {
      await System.show(stack, '天変雷舞・威神電震', 'コスト2以下の全ユニットを消滅');

      // 全てのコスト2以下のユニットを消滅
      for (const unit of lowCostUnits) {
        Effect.delete(stack, stack.processing, unit);
      }
    }
  },

  // アタック時効果
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対戦相手の行動済ユニットを検索
    const inactiveEnemyUnits = stack.processing.owner.opponent.field.filter(unit => !unit.active);

    if (inactiveEnemyUnits.length > 0) {
      await System.show(stack, '天変雷舞・威神電震', '行動済ユニットに5000ダメージ');

      // 全ての行動済ユニットに5000ダメージ
      for (const unit of inactiveEnemyUnits) {
        Effect.damage(stack, stack.processing, unit, 5000);
      }
    }
  },

  // 効果によって破壊された時の効果
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対戦相手のターン時のみ発動
    const isOpponentsTurn = stack.core.getTurnPlayer().id === stack.processing.owner.opponent.id;

    if (isOpponentsTurn && EffectHelper.isBreakByEffect(stack)) {
      // 対戦相手のユニットが存在するか確認
      const opponentUnits = EffectHelper.candidate(
        stack.core,
        unit => unit.owner.id !== stack.processing.owner.id,
        stack.processing.owner
      );

      if (opponentUnits.length > 0) {
        await System.show(stack, '天変雷舞・威神電震', 'ユニットの行動権を消費');

        // 対象を1体選択
        const [target] = await EffectHelper.selectUnit(
          stack,
          stack.processing.owner,
          opponentUnits,
          '行動権を消費するユニットを選択'
        );

        // 行動権を消費
        Effect.activate(stack, stack.processing, target, false);
      }
    }
  },
};
