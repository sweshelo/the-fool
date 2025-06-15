import type { Core } from '@/package/core/core';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'デッド・コーリング', '【不死】ユニットを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '不死' });
  },

  onBootSelf: async (stack: StackWithCard<Unit>) => {
    // 相手のフィールドにユニットが存在するか確認
    const selectableUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );

    if (selectableUnits.length > 0) {
      await System.show(stack, '冥界エール', '自身を破壊\n相手ユニットのレベル+1');
      const [selectedUnit] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        selectableUnits,
        'レベル+1するユニットを選んでください'
      );

      await Promise.all([
        Effect.break(stack, stack.processing, stack.processing, 'effect'),
        Effect.clock(stack, stack.processing, selectedUnit, 1),
      ]);
    }
  },

  isBootable: (core: Core, self: Unit) => {
    // 相手のフィールドにユニットが存在するか確認
    const selectableUnits = EffectHelper.candidate(
      core,
      unit => unit.owner.id !== self.owner.id,
      self.owner
    );
    return selectableUnits.length > 0;
  },
};
