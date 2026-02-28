import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    return stack.target instanceof Unit && stack.target.catalog.cost <= 1;
  },
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, 'アゲンスト', '手札に戻す');
    if (stack.target instanceof Unit) Effect.bounce(stack, stack.processing, stack.target, 'hand');
  },
};
