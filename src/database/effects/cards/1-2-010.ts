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

    // 昆虫ユニット
    const ownIncects = EffectHelper.candidate(
      stack.core,
      (unit: Unit) => !!unit.catalog.species?.includes('昆虫') && unit.owner.id === owner.id,
      stack.processing.owner
    );

    // 相手フィールドのユニット
    const opponentUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );

    await System.show(
      stack,
      '魔王剣・渇望ノ生贄',
      `BP+[【悪魔】×2000]${ownIncects.length > 0 ? '\n【昆虫】ユニットを1体選んで破壊' : ''}${ownIncects.length > 0 && opponentUnits.length > 0 ? '\n1体に5000ダメージ' : ''}`
    );

    // BP増加
    const numberDaemons = owner.field.filter(unit => unit.catalog.species?.includes('悪魔')).length;
    Effect.modifyBP(stack, stack.processing, stack.processing as Unit, numberDaemons * 2000, {
      event: 'turnEnd',
      count: 1,
    });

    if (ownIncects.length > 0) {
      const [breakUnit] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        ownIncects,
        '破壊する【昆虫】ユニットを選択'
      );

      if (opponentUnits.length > 0) {
        const [damageUnit] = await EffectHelper.selectUnit(
          stack,
          stack.processing.owner,
          opponentUnits,
          'ダメージを与えるユニットを選択'
        );
        Effect.damage(stack, stack.processing, damageUnit, 5000, 'effect');
      }

      Effect.break(stack, stack.processing, breakUnit, 'effect');
    }
  },
};
