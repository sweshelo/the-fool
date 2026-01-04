import { Unit } from '@/package/core/class/card';
import { Effect, System, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    // Cost check
    return (
      stack.target instanceof Unit &&
      stack.target.catalog.cost >= 6 &&
      stack.target.owner.id === stack.processing.owner.id
    );
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const target = stack.target;
    const owner = stack.processing.owner;

    // Type guard and ownership check
    if (!(target instanceof Unit)) return;

    await System.show(stack, 'VIP待遇', 'ドロー\nCP+1');

    // Draw 1 card
    EffectTemplate.draw(owner, stack.core);

    // Increase CP by 1
    Effect.modifyCP(stack, stack.processing, owner, 1);
  },
};
