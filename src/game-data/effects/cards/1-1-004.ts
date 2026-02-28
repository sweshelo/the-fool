import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(
      stack,
      '無我の境地＆固着',
      '相手の効果によって行動権を消費しない\n手札に戻らない'
    );
    Effect.keyword(stack, stack.processing, stack.processing, '無我の境地');
    Effect.keyword(stack, stack.processing, stack.processing, '固着');
  },
};
