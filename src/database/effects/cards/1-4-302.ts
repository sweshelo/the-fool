import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // バグ・サンシャイン：フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分の【昆虫】ユニットと対戦相手のユニットを選択
    const ownInsectUnits = EffectHelper.candidate(
      stack.core,
      unit =>
        unit.owner.id === stack.processing.owner.id &&
        (unit.catalog.species?.includes('昆虫') || false) &&
        unit.id !== stack.processing.id,
      stack.processing.owner
    );

    const enemyUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );

    // どちらも選択可能なユニットがある場合のみ発動
    if (ownInsectUnits.length > 0 && enemyUnits.length > 0) {
      await System.show(stack, 'バグ・サンシャイン', '【昆虫】ユニットを破壊\n5000ダメージ');

      // 自分の【昆虫】ユニットを選択
      const [insectUnit] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        ownInsectUnits,
        '破壊する【昆虫】ユニットを選択'
      );

      // 対戦相手のユニットを選択
      const [enemyUnit] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        enemyUnits,
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
    const brokenUnit = stack.target as Unit;

    if (
      brokenUnit.owner.id === stack.processing.owner.id &&
      brokenUnit.id !== stack.processing.id &&
      (brokenUnit.catalog.species?.includes('昆虫') || false)
    ) {
      const targets = EffectHelper.candidate(
        stack.core,
        unit => unit.owner.id === stack.processing.owner.opponent.id,
        stack.processing.owner
      );

      if (targets.length > 0) {
        await System.show(stack, 'バグ・ジャミング', '【防御禁止】を付与');

        const [target] = await EffectHelper.selectUnit(
          stack,
          stack.processing.owner,
          targets,
          '【防御禁止】を与えるユニットを選択'
        );

        Effect.keyword(stack, stack.processing, target, '防御禁止');
      }
    }
  },
};
