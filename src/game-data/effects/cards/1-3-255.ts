import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkAttack: (stack: StackWithCard) =>
    stack.source.id === stack.processing.owner.id &&
    stack.processing.owner.field.some(unit => unit.id === stack.target?.id),
  onAttack: async (stack: StackWithCard) => {
    await System.show(stack, 'タルンカッペ', 'BP以下のユニットにしかブロックされない');
    if (stack.target instanceof Unit) {
      Effect.keyword(stack, stack.processing, stack.target, '次元干渉', {
        condition: (self, blocker) => (self?.currentBP ?? 0) < (blocker?.currentBP ?? 0),
        event: '_postBattle',
        count: 1,
      });
    }
  },
};
