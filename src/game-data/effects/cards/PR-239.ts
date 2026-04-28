import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkBattle: (stack: StackWithCard) =>
    [stack.source, stack.target].some(
      object => object instanceof Unit && object.owner.field.some(unit => unit.id === object?.id)
    ),
  onBattle: async (stack: StackWithCard) => {
    await System.show(stack, '望まぬ争い', '【不滅】とデスカウンター[1]を付与');
    if (stack.target instanceof Unit) {
      Effect.death(stack, stack.processing, stack.target, 1);
      Effect.keyword(stack, stack.processing, stack.target, '不滅');
    }
    if (stack.source instanceof Unit) {
      Effect.death(stack, stack.processing, stack.source, 1);
      Effect.keyword(stack, stack.processing, stack.source, '不滅');
    }
  },
};
