import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、自身にスピードムーブを付与し、
  // 対戦相手のコスト2以下のユニット1体を選ぶ。それの行動権を消費する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const owner = self.owner;
    const opponent = owner.opponent;

    // 対戦相手のコスト2以下のユニットを選択するフィルタ
    const filter = (unit: Unit) => unit.owner.id === opponent.id && unit.catalog.cost <= 2;

    // 対戦相手のコスト2以下のユニットが選択可能かチェック
    const canSelectTarget = EffectHelper.isUnitSelectable(stack.core, filter, owner);

    // メッセージ構築と表示
    const effectName = canSelectTarget ? 'システムγ' : 'スピードムーブ';
    const message = canSelectTarget
      ? '【スピードムーブ】\n行動権を消費する'
      : '行動制限の影響を受けない';
    await System.show(stack, effectName, message);

    // スピードムーブを自身に付与
    Effect.speedMove(stack, self);

    // 対戦相手のコスト2以下のユニットが選択可能な場合
    if (canSelectTarget) {
      // コスト2以下のユニットを選択
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        filter,
        'コスト2以下のユニットを選択'
      );

      // 行動権を消費する
      Effect.activate(stack, self, target, false);
    }
  },
};
