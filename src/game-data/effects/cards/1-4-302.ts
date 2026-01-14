import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // バグ・サンシャイン：フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分の【昆虫】ユニットと対戦相手のユニットを選択
    const filter = (unit: Unit) =>
      unit.owner.id === stack.processing.owner.id &&
      (unit.catalog.species?.includes('昆虫') || false) &&
      unit.id !== stack.processing.id;

    // どちらも選択可能なユニットがある場合のみ発動
    if (
      EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner) &&
      EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)
    ) {
      await System.show(stack, 'バグ・サンシャイン', '【昆虫】ユニットを破壊\n5000ダメージ');

      // 自分の【昆虫】ユニットを選択
      const [insectUnit] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '破壊する【昆虫】ユニットを選択'
      );

      // 対戦相手のユニットを選択
      const [enemyUnit] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'ダメージを与えるユニットを選択'
      );

      // 自分の【昆虫】ユニットを破壊
      Effect.break(stack, stack.processing, insectUnit);

      // 対戦相手のユニットに5000ダメージ
      Effect.damage(stack, stack.processing, enemyUnit, 5000);
    }
  },

  // バグ・ジャミング：【昆虫】ユニットが破壊されるたびに発動
  onBreak: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 破壊されたユニットが自分の【昆虫】ユニットかチェック
    const brokenUnit = stack.target;

    if (
      brokenUnit instanceof Unit &&
      brokenUnit.owner.id === stack.processing.owner.id &&
      brokenUnit.id !== stack.processing.id &&
      (brokenUnit.catalog.species?.includes('昆虫') || false)
    ) {
      if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
        await System.show(stack, 'バグ・ジャミング', '【防御禁止】を付与');

        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          'opponents',
          '【防御禁止】を与えるユニットを選択'
        );

        Effect.keyword(stack, stack.processing, target, '防御禁止');
      }
    }
  },
};
