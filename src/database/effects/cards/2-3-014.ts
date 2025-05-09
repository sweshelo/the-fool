import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 血飢の虎徹 - When unit is summoned
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // Count 侍 units on field (including this one)
    const samuraiCount = owner.field.filter(unit => unit.catalog.species?.includes('侍')).length;

    if (samuraiCount >= 3) {
      // Find opponent's highest BP units
      const opponentUnits = owner.opponent.field;
      if (opponentUnits.length === 0) return;

      // Get max BP value
      const maxBP = Math.max(...opponentUnits.map(unit => unit.currentBP));
      // Filter units with max BP
      const targets = opponentUnits.filter(unit => unit.currentBP === maxBP);

      if (targets.length > 0) {
        await System.show(stack, '血飢の虎徹', 'BPが最も高いユニットをランダムで破壊');

        // Randomly select one unit and destroy it
        const [target] = EffectHelper.random(targets, 1);
        if (target) {
          Effect.break(stack, stack.processing, target);
        }
      }
    }
  },

  // 極中法度 - At the end of your turn
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    // Only activate on your turn end
    if (stack.processing.owner.id !== stack.core.getTurnPlayer().id) return;

    // Find 侍 units in deck
    const targets = stack.processing.owner.deck.filter(
      card => card instanceof Unit && card.catalog.species?.includes('侍')
    );

    if (targets.length > 0) {
      await System.show(stack, '極中法度', '【侍】ユニットを捨てる');

      // Select a samurai unit to discard
      const [target] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        targets as Unit[],
        '捨てる【侍】ユニットを選択'
      );

      // Move it to trash
      Effect.move(stack, stack.processing, target, 'trash');
    }
  },

  // When destroyed
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // Find cost 4 or lower samurai units in trash
    const targets = stack.processing.owner.trash.filter(
      card => card instanceof Unit && card.catalog.species?.includes('侍') && card.catalog.cost <= 4
    );

    if (targets.length > 0) {
      await System.show(stack, '極中法度', 'コスト4以下の【侍】を【特殊召喚】\n自身を消滅');

      // Select a unit to summon
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        targets as Unit[],
        '特殊召喚する【侍】ユニットを選択'
      );

      // Special summon it
      const summoned = await Effect.summon(stack, stack.processing, target);

      if (summoned) {
        // Delete this unit
        Effect.delete(stack, stack.processing, stack.processing);
      }
    }
  },
};
