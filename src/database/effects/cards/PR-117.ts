import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const myInsectFilter = (unit: Unit) =>
      unit.owner.id === stack.processing.owner.id &&
      (unit.catalog.species?.includes('昆虫') || false);

    const enemyActedFilter = (unit: Unit) =>
      unit.owner.id !== stack.processing.owner.id && unit.active === false;
    // どちらも選択可能なユニットがある場合のみ発動
    if (
      EffectHelper.isUnitSelectable(stack.core, myInsectFilter, stack.processing.owner) &&
      EffectHelper.isUnitSelectable(stack.core, enemyActedFilter, stack.processing.owner)
    ) {
      await System.show(
        stack,
        'ちくりとするよ！',
        'ユニットを【消滅】する\n【昆虫】ユニットを破壊'
      );

      const [insectUnit] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        myInsectFilter,
        '破壊する【昆虫】ユニットを選択'
      );

      const [enemyUnit] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        enemyActedFilter,
        '消滅させる対戦相手の行動済ユニットを選択'
      );

      // 自分の昆虫ユニットを破壊し、相手の行動済ユニットを消滅させる
      Effect.break(stack, stack.processing, insectUnit);
      Effect.delete(stack, stack.processing, enemyUnit);
    }
  },
};
