import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■冥土の献上品
  // 対戦相手のユニットがフィールドに出た時、あなたのユニットを1体選ぶ。
  // それを破壊する。そうした場合、フィールドに出たユニットを破壊する。

  // インターセプトカード用チェッカー実装
  checkDrive(stack: StackWithCard): boolean {
    const owner = stack.processing.owner;
    const filter = (unit: Unit) => unit.owner.id === owner.id;

    // 相手のユニットが召喚された時かつ自分のフィールドにユニットがいる場合に発動
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === owner.opponent.id &&
      EffectHelper.isUnitSelectable(stack.core, filter, owner)
    );
  },

  async onDrive(stack: StackWithCard) {
    const owner = stack.processing.owner;

    // 対戦相手の召喚したユニット
    const summonedUnit = stack.target;

    // 自分のユニットの選択肢を作成
    const filter = (unit: Unit) => unit.owner.id === owner.id;

    if (summonedUnit instanceof Unit && EffectHelper.isUnitSelectable(stack.core, filter, owner)) {
      await System.show(stack, '冥土の献上品', '自ユニットを破壊\n相手ユニットを破壊');

      // 自分のユニットを1体選択
      const [selectedUnit] = await EffectHelper.pickUnit(
        stack,
        owner,
        filter,
        '破壊する自分のユニットを選択'
      );

      // 選択したユニットを破壊
      Effect.break(stack, stack.processing, selectedUnit);

      // フィールドに出たユニット(相手ユニット)を破壊
      Effect.break(stack, stack.processing, summonedUnit);
    }
  },
};
