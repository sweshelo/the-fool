import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ソウルシューター
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    // Always call System.show regardless of whether there are valid targets
    await System.show(stack, 'ソウルシューター', 'レベル2以上のユニットを捨てる');

    // Find level 2+ unit cards in opponent's hand
    const targets = opponent.hand.filter(card => card instanceof Unit && card.lv >= 2);

    if (targets.length > 0) {
      // Get a random target
      const randomTarget = EffectHelper.random(targets, 1)[0];

      // Make sure we have a valid target
      if (randomTarget) {
        // Discard it
        Effect.handes(stack, stack.processing, randomTarget);
      }
    }
  },
};
