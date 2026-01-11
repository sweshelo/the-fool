import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    if (stack.source.id !== stack.processing.owner.id || !(stack.processing instanceof Unit))
      return;

    await System.show(stack, 'クロック・アップ', 'レベル+1');
    Effect.clock(stack, stack.processing, stack.processing, 1);
  },

  onOverclockSelf: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.processing instanceof Unit)) return;

    const owner = stack.processing.owner;

    const hasTargets = EffectHelper.isUnitSelectable(
      stack.core,
      'opponents',
      stack.processing.owner
    );

    await System.show(stack, '爆発する寄生魚', `${hasTargets ? 'レベル+1\n' : ''}自身を破壊`);
    if (hasTargets) {
      // ユニットの選択を実施する
      const selection: Unit[] = await EffectHelper.pickUnit(
        stack,
        owner,
        'opponents',
        'レベルを+1するユニットを選択',
        2
      );

      selection.forEach(unit => Effect.clock(stack, stack.processing, unit, 1));
    }

    Effect.break(stack, stack.processing, stack.processing, 'effect');
  },
};
