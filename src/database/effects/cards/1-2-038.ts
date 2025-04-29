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
    const candidate = EffectHelper.candidate(
      stack.core,
      (unit: Unit) => unit.owner.id !== owner.id
    );

    await System.show(
      stack,
      '爆発する寄生魚',
      `${candidate.length > 0 ? 'レベル+1\n' : ''}自身を破壊`
    );
    if (candidate.length > 0) {
      // ユニットの選択を実施する
      const count = Math.min(candidate.length, 2);
      const selection: string[] = [];

      for (let i = 0; i < count; i++) {
        const [unit] = await System.prompt(stack, owner.id, {
          type: 'unit',
          title: 'レベルを+1するユニットを選択',
          items: candidate.filter(unit => !selection.includes(unit.id)),
        });

        if (unit) selection.push(unit);
      }

      candidate
        .filter(unit => selection.includes(unit.id))
        .forEach(unit => Effect.clock(stack, stack.processing, unit, 1));
    }

    Effect.break(stack, stack.processing, stack.processing, 'effect');
  },
};
