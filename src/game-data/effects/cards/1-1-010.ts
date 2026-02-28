import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(
      stack,
      '加護＆次元干渉／コスト3',
      '効果に選ばれない\nコスト3以上にブロックされない'
    );
    Effect.keyword(stack, stack.processing, stack.processing, '加護');
    Effect.keyword(stack, stack.processing, stack.processing, '次元干渉', { cost: 3 });
  },
};
