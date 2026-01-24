import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

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
    const owner = stack.processing.owner;
    // Count Samurai units on the field
    const samuraiUnitsOnField = owner.field.filter(unit => unit.catalog.species?.includes('侍'));
    const samuraiCount = samuraiUnitsOnField.length;

    // Check if the condition is met (2 or fewer Samurai units)
    if (samuraiCount <= 2) {
      // For each Samurai unit, give Fortitude and Order Shield
      samuraiUnitsOnField.forEach(unit => {
        // Check for existing delta from this unit
        const fortitudeDelta = unit.delta.find(
          delta =>
            delta.source?.unit === stack.processing.id &&
            delta.source?.effectCode === '白拍子の鼓舞_不屈'
        );

        const orderShieldDelta = unit.delta.find(
          delta =>
            delta.source?.unit === stack.processing.id &&
            delta.source?.effectCode === '白拍子の鼓舞_秩序の盾'
        );

        // Apply Fortitude if not already applied
        if (!fortitudeDelta) {
          Effect.keyword(stack, stack.processing, unit, '不屈', {
            source: { unit: stack.processing.id, effectCode: '白拍子の鼓舞_不屈' },
          });
        }

        // Apply Order Shield if not already applied
        if (!orderShieldDelta) {
          Effect.keyword(stack, stack.processing, unit, '秩序の盾', {
            source: { unit: stack.processing.id, effectCode: '白拍子の鼓舞_秩序の盾' },
          });
        }
      });
    } else {
      // Remove the keywords if condition is no longer met
      samuraiUnitsOnField.forEach(unit => {
        unit.delta = unit.delta.filter(
          delta =>
            !(
              delta.source?.unit === stack.processing.id &&
              (delta.source?.effectCode === '白拍子の鼓舞_不屈' ||
                delta.source?.effectCode === '白拍子の鼓舞_秩序の盾')
            )
        );
      });
    }
  },
};
