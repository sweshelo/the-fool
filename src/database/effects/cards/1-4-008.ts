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

  // 自身がオーバークロックした時に発動する効果を記述
  onOverclockSelf: async (stack: StackWithCard) => {
    const opponent = stack.processing.owner.opponent;
    const filter = (unit: Unit) => {
      return opponent.field.some(u => u.id === unit.id);
    };

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, '破界炎舞・絶華繚乱', '10000ダメージ');
      const owner = stack.processing.owner;
      const [unit] = await EffectHelper.pickUnit(
        stack,
        owner,
        filter,
        'ダメージを与えるユニットを選択'
      );
      if (!unit) throw new Error('存在しないユニットが選択されました');
      Effect.damage(stack, stack.processing!, unit, 10000);
    }
  },

  // アタック時：あなたの【神】ユニット1体につき自身のBP+2000（ターン終了時まで）
  onAttackSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const godCount = owner.field.filter(unit => unit.catalog.species?.includes('神')).length;
    if (godCount <= 0) return;
    const bpBoost = godCount * 2000;
    await System.show(stack, '破界炎舞・絶華繚乱', `BP+[【神】×2000）]`);
    Effect.modifyBP(stack, stack.processing, stack.processing as Unit, bpBoost, {
      event: 'turnEnd',
      count: 1,
    });
  },

  // 手札効果：自分の赤のユニットが場にいる場合、このユニットのコスト-1
  handEffect: (core: unknown, self: Unit) => {
    if (!self.delta.some(delta => delta.source?.unit === self.id)) {
      if (self.owner.field.some(unit => unit.catalog.color === Color.RED))
        self.delta.push(new Delta({ type: 'cost', value: -1 }, { source: { unit: self.id } }));
    } else {
      if (!self.owner.field.some(unit => unit.catalog.color === Color.RED))
        self.delta = self.delta.filter(delta => delta.source?.unit !== self.id);
    }
  },
};
