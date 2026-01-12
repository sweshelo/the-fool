import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { EffectHelper } from '../classes/helper';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const filter = (unit: Unit) =>
      unit.owner.id !== stack.processing.owner.id && unit.currentBP > unit.bp;
    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, '傲慢の形', 'BP上昇中のユニットを1体破壊');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '破壊するユニットを選択して下さい'
      );
      Effect.break(stack, stack.processing, target);
    }
  },
};
