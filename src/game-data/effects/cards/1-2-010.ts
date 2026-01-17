import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const opponent = stack.processing.owner.opponent;
    const [singleTarget] = opponent.field;

    if (opponent.field.length === 0) {
      return;
    } else if (opponent.field.length === 1 && singleTarget) {
      await System.show(stack, '蠅魔王剣・滅亡ノ瞳', '10000ダメージ');
      Effect.damage(stack, stack.processing, singleTarget, 10000, 'effect');
    } else {
      await System.show(stack, '蠅魔王剣・滅亡ノ瞳', 'ランダムで2体に5000ダメージ');
      const targets = EffectHelper.random(opponent.field, 2);
      targets.forEach(unit => Effect.damage(stack, stack.processing, unit, 5000));
    }
  },

  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 昆虫ユニット
    const insectFilter = (unit: Unit) =>
      !!unit.catalog.species?.includes('昆虫') && unit.owner.id === owner.id;

    // 相手フィールドのユニット
    const opponentFilter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;

    const hasInsects = EffectHelper.isUnitSelectable(
      stack.core,
      insectFilter,
      stack.processing.owner
    );
    const hasOpponents = EffectHelper.isUnitSelectable(
      stack.core,
      opponentFilter,
      stack.processing.owner
    );

    await System.show(
      stack,
      '魔王剣・渇望ノ生贄',
      `BP+[【悪魔】×2000]${hasInsects ? '\n【昆虫】ユニットを1体選んで破壊' : ''}${hasInsects && hasOpponents ? '\n1体に5000ダメージ' : ''}`
    );

    // BP増加
    const numberDaemons = owner.field.filter(unit => unit.catalog.species?.includes('悪魔')).length;
    Effect.modifyBP(stack, stack.processing, stack.processing, numberDaemons * 2000, {
      event: 'turnEnd',
      count: 1,
    });

    if (hasInsects) {
      const [breakUnit] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        insectFilter,
        '破壊する【昆虫】ユニットを選択'
      );

      if (hasOpponents) {
        const [damageUnit] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          opponentFilter,
          'ダメージを与えるユニットを選択'
        );
        Effect.damage(stack, stack.processing, damageUnit, 5000, 'effect');
      }

      Effect.break(stack, stack.processing, breakUnit, 'effect');
    }
  },
};
