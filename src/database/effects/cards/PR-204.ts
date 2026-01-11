import type { Unit } from '@/package/core/class/card';
import { EffectHelper } from '../classes/helper';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Effect } from '../classes/effect';

const getOpponentsBpReducedUnitsFilter = (stack: StackWithCard) => (unit: Unit) =>
  unit.owner.id !== stack.processing.owner.id && unit.bp > unit.currentBP;

export const effects: CardEffects = {
  checkAttack: stack =>
    stack.processing.owner.id === stack.source.id &&
    EffectHelper.isUnitSelectable(
      stack.core,
      getOpponentsBpReducedUnitsFilter(stack),
      stack.processing.owner
    ),
  onAttack: async (stack: StackWithCard) => {
    await System.show(stack, '纏わりつく炎蛇', '一時的にBPが減少しているユニットを破壊');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      getOpponentsBpReducedUnitsFilter(stack),
      '破壊するユニットを選択して下さい'
    );
    Effect.break(stack, stack.processing, target);
  },
};
