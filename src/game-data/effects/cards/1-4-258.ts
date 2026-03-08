import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Card, Unit } from '@/package/core/class/card';

const getSelfUnderCost3Filter = (self: Card) => (unit: Unit) =>
  self.owner.id === unit.owner.id && unit.catalog.cost <= 3;

export const effects: CardEffects = {
  checkTurnStart: (stack: StackWithCard) =>
    stack.source.id === stack.processing.owner.id &&
    stack.processing.owner.field.length <= 4 &&
    EffectHelper.isUnitSelectable(
      stack.core,
      getSelfUnderCost3Filter(stack.processing),
      stack.processing.owner
    ),
  onTurnStart: async (stack: StackWithCard) => {
    await System.show(stack, '大天使の息吹', 'コスト3以下を【複製】');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      getSelfUnderCost3Filter(stack.processing),
      '【複製】するユニットを選択'
    );
    await Effect.clone(stack, stack.processing, target, stack.processing.owner);
  },
};
