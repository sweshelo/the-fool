import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkPlayerAttack: (stack: StackWithCard) => {
    return (
      stack.source instanceof Unit &&
      stack.source.owner.id === stack.processing.owner.id &&
      stack.processing.owner.field.length <= 3
    );
  },

  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '魔女の口づけ', 'デッキから2体【特殊召喚】');
    const targets = EffectHelper.random(
      stack.processing.owner.deck.filter(
        (card): card is Unit => card.catalog.type === 'unit' && card.catalog.cost <= 2
      ),
      2
    );
    for (const unit of targets) {
      await Effect.summon(stack, stack.processing, unit);
    }
  },
};
