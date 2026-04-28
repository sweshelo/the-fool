import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

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

    await EffectHelper.combine(stack, [
      {
        title: '爆発する寄生魚',
        description: 'レベル+1',
        effect: async () => {
          (
            await EffectHelper.pickUnit(
              stack,
              owner,
              'opponents',
              'レベルを+1するユニットを選択',
              2
            )
          ).forEach(unit => Effect.clock(stack, stack.processing, unit, 1));
        },
        condition: EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner),
      },
      {
        title: '爆発する寄生魚',
        description: '自身を破壊',
        effect: () => Effect.break(stack, stack.processing, stack.processing, 'effect'),
      },
    ]);
  },
};
