import type { Unit } from '@/package/core/class/card';
import { EffectHelper } from '../classes/helper';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const filter = (unit: Unit) =>
      unit.owner.id === stack.processing.owner.id && unit.catalog.cost <= 2;
    if (
      stack.processing.owner.field.length > 4 ||
      !EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)
    )
      return;

    await System.show(stack, '欧忍法・ウツシミ', 'コスト2以下を【複製】');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      '【複製】するユニットを選択してください'
    );
    await Effect.clone(stack, stack.processing, target, stack.processing.owner);
  },
};
