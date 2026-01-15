import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';

export const effects: CardEffects = {
  onBreakSelf: async (stack: StackWithCard<Unit>) => {
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id && unit.lv >= 2;
    if (
      stack.option?.type === 'break' &&
      stack.option.cause === 'battle' &&
      EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)
    ) {
      await System.show(stack, 'アトランティックアーツ', 'レベル2以上のユニットを1体破壊');
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
