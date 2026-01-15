import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    const filter = (unit: Unit) =>
      unit.owner.id === stack.processing.owner.id && unit.catalog.color === Color.GREEN;

    if (
      stack.processing.owner.id === stack.source.id &&
      EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)
    ) {
      await System.show(stack, 'グリーン・クロック', '緑属性ユニットのレベル+1');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        'レベルを+1するユニットを選択して下さい'
      );
      Effect.clock(stack, stack.processing, target, 1);
    }
  },
};
