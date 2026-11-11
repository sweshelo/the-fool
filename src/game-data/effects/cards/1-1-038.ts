import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

const getFilter = (stack: StackWithCard) => (unit: Unit) =>
  unit.owner.id === stack.processing.owner.id && !unit.active;

export const effects: CardEffects = {
  checkAttack: (stack: StackWithCard) => {
    return (
      stack.source.id !== stack.processing.owner.id &&
      EffectHelper.isUnitSelectable(stack.core, getFilter(stack), stack.processing.owner)
    );
  },
  onAttack: async (stack: StackWithCard) => {
    await System.show(stack, '土下座', '行動権を回復\nBP+1000');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      getFilter(stack),
      '行動権を回復し、BP+1000するユニットを選択してください'
    );
    Effect.activate(stack, stack.processing, target, true);
    Effect.modifyBP(stack, stack.processing, target, 1000, { event: 'turnEnd', count: 1 });
  },
};
