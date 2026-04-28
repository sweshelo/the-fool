import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkAttack: (stack: StackWithCard) =>
    stack.target instanceof Unit &&
    stack.target.owner.id === stack.processing.owner.id &&
    stack.target.owner.field.some(unit => unit.id === stack.target?.id),
  onAttack: async (stack: StackWithCard) => {
    await System.show(stack, '浮遊術', 'ブロックされない');
    if (stack.target instanceof Unit) {
      Effect.keyword(stack, stack.processing, stack.target, '次元干渉', {
        condition: () => true,
        event: 'turnEnd',
        count: 1,
      });
    }
  },
};
