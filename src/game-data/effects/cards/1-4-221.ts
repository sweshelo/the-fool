import { Card, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    // Find Samurai units in hand
    const samuraiUnitsInHand = owner.hand.filter(
      card => card instanceof Unit && card.catalog.species?.includes('侍')
    );
    const [discardTarget] = EffectHelper.random(samuraiUnitsInHand);

    await EffectHelper.combine(stack, [
      {
        title: '白拍子の鼓舞',
        description: '【侍】に【不屈】と【秩序の盾】を与える',
        effect: () => {},
      },
      {
        title: '永久の待ち人',
        description: '手札から【侍】を捨てる\nデッキから【侍】を選んで引く',
        effect: async () => {
          // Randomly select one Samurai unit to discard
          // Find Samurai units in deck for search
          const samuraiUnitsInDeck = owner.deck.filter(
            card => card instanceof Unit && card.catalog.species?.includes('侍')
          );
          const [selectedCard] = await EffectHelper.selectCard(
            stack,
            owner,
            samuraiUnitsInDeck,
            '手札に加えるカードを選択して下さい'
          );
          // Add selected card to hand
          Effect.move(stack, stack.processing, selectedCard, 'hand');
          // Discard the selected card
          if (discardTarget) Effect.break(stack, stack.processing, discardTarget);
        },
        condition: discardTarget !== undefined,
      },
    ]);
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit) {
          Effect.keyword(stack, stack.processing, target, '不屈', { source });
          Effect.keyword(stack, stack.processing, target, '秩序の盾', { source });
        }
      },
      targets: ['owns'],
      effectCode: '白拍子の鼓舞',
      condition: (target: Card) =>
        target.catalog.species?.includes('侍') &&
        stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('侍')).length <=
          2,
    });
  },
};
