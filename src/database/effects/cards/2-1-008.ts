import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 支援狙撃：フィールドに出た時、自分の【戦士】ユニットを1体選び、行動権を回復する
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const targetsFilter = (unit: Unit) => {
      return (
        unit.owner.id === stack.processing.owner.id &&
        (unit.catalog.species?.includes('戦士') ?? false) &&
        unit.id !== stack.processing.id
      );
    };
    const targets_selectable = EffectHelper.isUnitSelectable(
      stack.core,
      targetsFilter,
      stack.processing.owner
    );

    if (targets_selectable) {
      await System.show(stack, '支援狙撃', '行動権回復');

      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        targetsFilter,
        '行動権を回復するユニットを選択'
      );

      Effect.activate(stack, stack.processing, target, true);
    }
  },
};
