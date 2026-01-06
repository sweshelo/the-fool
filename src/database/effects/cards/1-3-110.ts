import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■雷式機工甲冑
  // このユニットがフィールドに出た時、あなたの【機械】が2体以上いる場合、このユニット以外のあなたの全てのユニットの基本BPを+2000する。
  // このユニットがアタックした時、【機械】ユニットが3体以上いる場合、対戦相手のユニット1体を選ぶ。それを対戦相手の手札に戻す。
  // 対戦相手のターン終了時、行動権消費状態のユニット1体に［【機械】×2000］ダメージを与える。

  // フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分の機械ユニットをカウント
    const machineUnits = owner.field.filter(
      unit => Array.isArray(unit.catalog.species) && unit.catalog.species.includes('機械')
    );

    // 自分の機械ユニットが2体以上いる場合
    if (machineUnits.length >= 2) {
      await System.show(stack, '雷式機工甲冑', '味方全体の基本BP+2000');

      // このユニット以外の全てのユニットに基本BP+2000
      owner.field.forEach(unit => {
        if (unit.id !== stack.processing.id) {
          Effect.modifyBP(stack, stack.processing, unit, 2000, { isBaseBP: true });
        }
      });
    }
  },

  // アタック時の効果
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;

    // 自分の機械ユニットをカウント
    const machineUnits = owner.field.filter(
      unit => Array.isArray(unit.catalog.species) && unit.catalog.species.includes('機械')
    );

    // 機械ユニットが3体以上いる場合
    if (
      machineUnits.length >= 3 &&
      EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)
    ) {
      await System.show(stack, '雷式機工甲冑', '敵ユニットを手札に戻す');

      // 対戦相手のユニットを1体選択
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        filter,
        '手札に戻すユニットを選択'
      );

      if (target) {
        // 対戦相手の手札に戻す
        Effect.bounce(stack, stack.processing, target, 'hand');
      }
    }
  },

  // 対戦相手のターン終了時の効果
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のターン終了時のみ発動
    if (opponent.id === stack.core.getTurnPlayer().id) {
      // フィールド上の行動権消費状態のユニットをフィルタリング
      const filter = (unit: Unit) => !unit.active;

      if (EffectHelper.isUnitSelectable(stack.core, filter, owner)) {
        // 自分の機械ユニットをカウント
        const machineUnits = owner.field.filter(
          unit => Array.isArray(unit.catalog.species) && unit.catalog.species.includes('機械')
        );

        // 与えるダメージを計算（機械ユニットの数 × 2000）
        const damage = machineUnits.length * 2000;

        if (damage > 0) {
          await System.show(stack, '雷式機工甲冑', `行動済ユニットに[【機械】×2000]ダメージ`);

          // ユニットを1体選択
          const [target] = await EffectHelper.pickUnit(
            stack,
            owner,
            filter,
            `ダメージを与えるユニットを選択`
          );

          if (target) {
            // ダメージを与える
            Effect.damage(stack, stack.processing, target, damage);
          }
        }
      }
    }
  },
};
