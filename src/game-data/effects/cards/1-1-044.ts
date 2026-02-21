import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  onAttackSelf: async (stack: StackWithCard) => {
    if (stack.processing.owner.opponent.field.length > 0) {
      await System.show(stack, '灼熱の業火', '敵全体に3000ダメージ');
      stack.processing.owner.opponent.field.forEach(unit =>
        Effect.damage(stack, stack.processing, unit, 3000)
      );
    }
  },
};
