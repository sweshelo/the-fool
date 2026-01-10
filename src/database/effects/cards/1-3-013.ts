import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { EffectHelper } from '../classes/helper';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const filter = (unit: Unit) =>
      (unit.owner.id === stack.processing.owner.id && unit.catalog.species?.includes('侍')) ||
      false;
    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, 'ヒヒイロカネの輝き', '味方の【侍】に【加護】を付与');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '【加護】を与えるユニットを選択して下さい'
      );
      Effect.keyword(stack, stack.processing, target, '加護');
    }
  },

  onBlockSelf: async (stack: StackWithCard) => {
    await System.show(stack, '開眼の戦女', '味方の【侍】のBP+1000');
    stack.processing.owner.field
      .filter(unit => unit.catalog.species?.includes('侍'))
      .forEach(unit =>
        Effect.modifyBP(stack, stack.processing, unit, 1000, { event: 'turnEnd', count: 1 })
      );
  },
};
