import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  // 起動・フォース＜ウィルス・黙＞
  isBootable: (core: Core, self: Unit): boolean => {
    return EffectHelper.isVirusInjectable(self.owner.opponent);
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '起動・フォース＜ウィルス・黙＞', '＜ウィルス・黙＞を1体【特殊召喚】');
    await EffectTemplate.virusInject(stack, stack.processing.owner.opponent, '＜ウィルス・黙＞');
  },

  // ウィルスクラッシュ
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    // Find virus units on opponent's field
    const virusUnits = opponent.field.filter(unit => unit.catalog.species?.includes('ウィルス'));

    if (virusUnits.length > 0) {
      await System.show(
        stack,
        'ウィルスクラッシュ',
        '【ウィルス】ユニットを破壊\n対戦相手のユニットを破壊'
      );

      // Select a virus unit to destroy
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        virusUnits,
        '破壊する【ウィルス】ユニットを選択'
      );

      // Get all opponent units for second destruction
      const opponentUnits = EffectHelper.candidate(
        stack.core,
        unit => unit.owner.id !== stack.processing.owner.id && unit.id !== target.id,
        stack.processing.owner
      );

      if (opponentUnits.length > 0) {
        // Select a unit to destroy
        const [secondTarget] = await EffectHelper.selectUnit(
          stack,
          stack.processing.owner,
          opponentUnits,
          '破壊するユニットを選択'
        );

        Effect.break(stack, stack.processing, target);
        Effect.break(stack, stack.processing, secondTarget);
      }
    }
  },
};
