import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '煉獄の判決＆消滅効果耐性',
      '敵全体のBP-1000\n対戦相手の効果によって消滅しない'
    );
    Effect.keyword(stack, stack.processing, stack.processing, '消滅効果耐性');
    Effect.speedMove(stack, stack.processing);
  },

  fieldEffect: (stack: StackWithCard) => {
    stack.processing.owner.opponent.field.forEach(unit => {
      if (!unit.delta.some(delta => delta.source?.unit === stack.processing.id)) {
        Effect.modifyBP(stack, stack.processing, unit, -1000, {
          source: { unit: stack.processing.id },
        });
      }
    });
  },
};
