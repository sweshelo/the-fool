import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'スーパーチャージ＆固着', 'CP+3\n手札に戻らない');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 3);
    Effect.keyword(stack, stack.processing, stack.processing, '固着');
  },
};
