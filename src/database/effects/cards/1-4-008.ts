import type { Unit } from '@/package/core/class/card';
import { EffectHelper, System, Effect } from '..';
import type { StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';
import { Delta } from '@/package/core/class/delta';

export const effects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard) => {
    const opponent = stack.processing.owner.opponent;
    if (opponent.field.length <= 0) return;
    const damage = opponent.field.length * 1000;
    await System.show(stack, '破界炎舞・絶華繚乱', '相手フィールドのユニット数×1000ダメージ');

    const effect = (unit: Unit) => Effect.damage(stack, stack.processing!, unit, damage);
    EffectHelper.exceptSelf(stack.core, stack.processing as Unit, effect);
  },

  // 自身以外が召喚された時に発動する効果を記述
  // 味方ユニットであるかの判定などを忘れない
  onOverclockSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    /*    const filter = (unit: Unit) => {
      return opponent.field.some(u => u.id === unit.id);
    };*/
    const units = EffectHelper.isUnitSelectable(
      stack.core,
      unit => unit.owner.id === opponent.id,
      owner
    );

    if (!units) return;

    await System.show(stack, '破界炎舞・絶華繚乱', '10000ダメージ');
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      unit => unit.owner.id === opponent.id,
      '10000ダメージを与えるユニットを選択',
      1
    );
    Effect.damage(stack, stack.processing, target, 10000);
  },

  handEffect: (core: unknown, self: Unit) => {
    if (!self.delta.some(delta => delta.source?.unit === self.id)) {
      if (self.owner.field.some(unit => unit.catalog.color === Color.RED))
        self.delta.push(new Delta({ type: 'cost', value: -1 }, { source: { unit: self.id } }));
    } else {
      if (!self.owner.field.some(unit => unit.catalog.color === Color.RED))
        self.delta = self.delta.filter(delta => delta.source?.unit !== self.id);
    }
  },

  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;

    await System.show(stack, '破界炎舞・絶華繚乱', 'BP+[【神】×2000]');

    const godUnits = owner.field.filter(unit => unit.catalog.species?.includes('神'));

    Effect.modifyBP(stack, self, self, godUnits.length * 2000, {
      event: 'turnEnd',
      count: 1,
    });
  },
};
