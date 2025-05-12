import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  // 神々のロンド - When summoned, add up to 3 random units from trash to hand
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // Find unit cards in trash
    const trashUnits = stack.processing.owner.trash.filter(card => card instanceof Unit);

    if (trashUnits.length > 0) {
      await System.show(stack, '神々のロンド', '捨札から3枚回収');

      // Randomly select up to 3 units
      const targets = EffectHelper.random(trashUnits, Math.min(trashUnits.length, 3));

      // Add them to hand
      for (const target of targets) {
        Effect.move(stack, stack.processing, target, 'hand');
      }
    }
  },

  // 冥々たる黒蝶の儀 - When attacking, discard a unit to destroy units of same cost
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // Check for unit cards in hand
    const handUnits = owner.hand.filter(card => card instanceof Unit);

    if (handUnits.length > 0) {
      await System.show(
        stack,
        '冥々たる黒蝶の儀',
        '手札からユニットを捨てる\n同コストのユニットを破壊'
      );

      // Select a unit card to discard
      const [selectedCard] = await EffectHelper.selectCard(
        stack,
        owner,
        handUnits,
        '捨てるユニットカードを選択'
      );

      // Discard it
      Effect.handes(stack, stack.processing, selectedCard);

      // Get the cost of the discarded card
      const cost = selectedCard.catalog.cost;

      // Find all units with the same cost
      const sameCostUnits = stack.core.players
        .map(p => p.field)
        .flat()
        .filter(unit => unit.catalog.cost === cost);

      // Destroy all units with the same cost
      if (sameCostUnits.length > 0) {
        for (const unit of sameCostUnits) {
          Effect.break(stack, stack.processing, unit);
        }
      }
    }
  },

  // 輪廻転生の夜 - When broken, return to hand with cost reduced by 2
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '輪廻転生の夜', '手札に戻す\nコスト-2');

    // Return to hand instead of going to trash
    Effect.bounce(stack, stack.processing, stack.processing, 'hand');

    // Reduce cost by 2
    stack.processing.delta.push(
      new Delta({ type: 'cost', value: -2 }, undefined, undefined, undefined, undefined, true)
    );
  },
};
