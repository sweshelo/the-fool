import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    // Find Samurai units in hand
    const samuraiUnitsInHand = owner.hand.filter(
      card => card instanceof Unit && card.catalog.species?.includes('侍')
    );

    // Randomly select one Samurai unit to discard
    const [discardTarget] = EffectHelper.random(samuraiUnitsInHand);
    // Find Samurai units in deck for search
    const samuraiUnitsInDeck = owner.deck.filter(
      card => card instanceof Unit && card.catalog.species?.includes('侍')
    );

    if (discardTarget && samuraiUnitsInDeck.length > 0) {
      await System.show(
        stack,
        '白拍子の舞子＆永久の待ち人',
        '【侍】に【不屈】と【秩序の盾】を与える\n手札から【侍】を捨てる\nデッキから【侍】を選んで引く'
      );

      // Let player choose a Samurai unit from deck
      try {
        const [selectedCard] = await EffectHelper.selectCard(
          stack,
          owner,
          samuraiUnitsInDeck,
          '手札に加えるカードを選択して下さい'
        );

        // Add selected card to hand
        Effect.move(stack, stack.processing, selectedCard, 'hand');
        // Discard the selected card
        Effect.break(stack, stack.processing, discardTarget);
      } catch (error) {
        // Failed to select a card, do nothing
        console.error('Failed to select a card:', error);
      }
    } else {
      await System.show(stack, '白拍子の舞子', '【侍】に【不屈】と【秩序の盾】を与える');
    }
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.keyword(stack, stack.processing, target, '不屈', { source });
      },
      effectCode: '白拍子の鼓舞_不屈',
      targets: ['owns'],
      condition: target =>
        target instanceof Unit &&
        target.owner.field.filter(unit => unit.catalog.species?.includes('侍')).length <= 2 &&
        target.catalog.species?.includes('侍'),
    });

    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.keyword(stack, stack.processing, target, '秩序の盾', { source });
      },
      effectCode: '白拍子の鼓舞_秩序の盾',
      targets: ['owns'],
      condition: target =>
        target instanceof Unit &&
        target.owner.field.filter(unit => unit.catalog.species?.includes('侍')).length <= 2 &&
        target.catalog.species?.includes('侍'),
    });
  },
};
