import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const selectableUnitsFilter = (unit: Unit) => unit.owner.id === stack.processing.owner.id;

    if (EffectHelper.isUnitSelectable(stack.core, selectableUnitsFilter, stack.processing.owner)) {
      await System.show(stack, 'アナザーデリート', '自分のユニットを1体破壊\nCP+2');
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        selectableUnitsFilter,
        'アナザーデリート - 破壊するユニットを選択してください',
        1
      );

      // 選択したユニットを破壊
      Effect.break(stack, stack.processing, target);

      // CP+2
      Effect.modifyCP(stack, stack.processing, owner, 2);
    }
  },
};
