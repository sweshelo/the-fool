import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '神託', '奇跡を発動すると【神託】は取り除かれる');
    Effect.keyword(stack, stack.processing, stack.processing, '神託');
  },
  onBattleSelf: async (stack: StackWithCard<Unit>) => {
    const [target] = [stack.source, stack.target].filter(card => card?.id !== stack.processing.id);
    if (!(stack.processing.hasKeyword('神託') && target instanceof Unit)) return;
    await System.show(stack, '奇跡・戦亡の風韻', 'デッキに戻す');
    Effect.bounce(stack, stack.processing, target, 'deck');
    Effect.removeKeyword(stack, stack.processing, '神託');
  },
};
