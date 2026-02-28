import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit, type Card } from '@/package/core/class/card';
import { Color } from '@/submodule/suit/constant';

const getYellowFilter = (self: Card) => (unit: Unit) =>
  unit.catalog.color === Color.YELLOW && unit.owner.id === self.owner.id;

export const effect: CardEffects = {
  checkDrive: (stack: StackWithCard) =>
    EffectHelper.isUnitSelectable(
      stack.core,
      getYellowFilter(stack.processing),
      stack.processing.owner
    ) && stack.processing.owner.opponent.field.some(unit => unit.id === stack.target?.id),
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '熾天使の片翼', '手札に戻す');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      getYellowFilter(stack.processing),
      '手札に戻すユニットを選択'
    );
    [stack.target, target].forEach(unit => {
      if (unit instanceof Unit) Effect.bounce(stack, stack.processing, unit, 'hand');
    });
  },
};
