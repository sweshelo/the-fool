import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core';

export const effects: CardEffects = {
  // 起動・フォース＜ウィルス・黙＞
  isBootable: (_core: Core, self: Unit): boolean => {
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
    const virusFilter = (unit: Unit) =>
      unit.owner.id === opponent.id && !!unit.catalog.species?.includes('ウィルス');

    if (EffectHelper.isUnitSelectable(stack.core, virusFilter, stack.processing.owner)) {
      await System.show(
        stack,
        'ウィルスクラッシュ',
        '【ウィルス】ユニットを破壊\n対戦相手のユニットを破壊'
      );

      // Select a virus unit to destroy
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        virusFilter,
        '破壊する【ウィルス】ユニットを選択'
      );

      // Get all opponent units for second destruction
      const filter = (unit: Unit) =>
        unit.owner.id !== stack.processing.owner.id && unit.id !== target.id;

      if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
        // Select a unit to destroy
        const [secondTarget] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          '破壊するユニットを選択'
        );

        Effect.break(stack, stack.processing, target);
        Effect.break(stack, stack.processing, secondTarget);
      }
    }
  },
};
