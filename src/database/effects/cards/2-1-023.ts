import { Unit } from '@/package/core/class/card';
import { EffectHelper } from '../classes/helper';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Effect } from '../classes/effect';
import { System } from '../classes/system';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const filter = (unit: Unit) =>
      unit.owner.id === stack.processing.owner.id && unit.catalog.species?.includes('忍者');
    if (
      stack.processing.owner.field.length > 4 ||
      !EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)
    )
      return;

    await System.show(stack, '双影術', '【忍者】を【複製】する');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      '【複製】するユニットを選択してください'
    );
    await Effect.clone(stack, stack.processing, target, stack.processing.owner);
  },

  onBreak: async (stack: StackWithCard) => {
    if (
      !(stack.target instanceof Unit) ||
      stack.target.owner.id !== stack.processing.owner.id ||
      stack.target.id === stack.processing.id
    )
      return;
    await System.show(stack, '夜陰にまぎれて', '紫ゲージ+1');
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
  },
};
