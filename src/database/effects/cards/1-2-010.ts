import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    if (opponent.field.length === 0) {
      return;
    } else if (opponent.field.length === 1) {
      await System.show(stack, '蠅魔王剣・滅亡ノ瞳', '10000ダメージ');
      const [target] = opponent.field;
      Effect.damage(stack, stack.processing, target as Unit, 10000, 'effect');
    } else {
      await System.show(stack, '蠅魔王剣・滅亡ノ瞳', 'ランダムで2体に5000ダメージ');
      const targets = EffectHelper.random(opponent.field, 2);
      targets.forEach(unit => Effect.damage(stack, stack.processing, unit, 5000));
    }
  },

  onAttackSelf: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 昆虫ユニットがいるか
    const incectsFilter = (unit: Unit) =>
      unit.catalog.species!.includes('昆虫') && unit.owner.id === owner.id; // Unitは必ずspeciesを持つ
    const isIncectsUnitsOnOwnersField = owner.field.some(incectsFilter);

    // 相手フィールドにユニットがいるか
    const isUnitsOnOpponentField = opponent.field.length > 0;

    await System.show(
      stack,
      '魔王剣・渇望ノ生贄',
      `BP+[【悪魔】×2000]${isIncectsUnitsOnOwnersField ? '\n【昆虫】ユニットを1体選んで破壊' : ''}${isIncectsUnitsOnOwnersField && isUnitsOnOpponentField ? '\n1体に5000ダメージ' : ''}`
    );

    // BP増加
    const numberDaemons = owner.field.filter(unit => unit.catalog.species?.includes('悪魔')).length;
    Effect.modifyBP(stack, stack.processing, stack.processing as Unit, numberDaemons * 2000);

    if (isIncectsUnitsOnOwnersField) {
      const [breakUnitId] = await System.prompt(stack, owner.id, {
        type: 'unit',
        title: '破壊する【昆虫】ユニットを選択',
        items: EffectHelper.candidate(stack.core, incectsFilter),
      });
      const breakUnit = owner.field.find(unit => unit.id === breakUnitId);
      if (!breakUnit) throw new Error('対象のユニットが見つかりませんでした');

      Effect.break(stack, stack.processing, breakUnit, 'effect');

      if (isUnitsOnOpponentField) {
        const [damageUnitId] = await System.prompt(stack, owner.id, {
          type: 'unit',
          title: 'ダメージを与えるユニットを選択',
          items: EffectHelper.candidate(stack.core, (unit: Unit) => unit.owner.id !== owner.id),
        });
        const damageUnit = opponent.field.find(unit => unit.id === damageUnitId);
        if (!damageUnit) throw new Error('対象のユニットが見つかりませんでした');

        Effect.damage(stack, stack.processing, damageUnit, 5000, 'effect');
      }
    }
  },
};
