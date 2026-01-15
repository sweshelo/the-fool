import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '地裂地轟&万物共鳴',
      '【貫通】\nCP+[コスト×1]\n【攻撃禁止】を与える\nBP+[フィールドのユニット数×500]'
    );
    Effect.keyword(stack, stack.processing, stack.processing, '貫通');
    EffectHelper.random(stack.processing.owner.opponent.field, 2).forEach(unit => {
      Effect.keyword(stack, stack.processing, unit, '攻撃禁止', {
        event: 'turnEnd',
        count: 1,
        onlyForOwnersTurn: true,
      });
      Effect.modifyCP(stack, stack.processing, stack.processing.owner, unit.catalog.cost);
    });
  },

  fieldEffect: (stack: StackWithCard) => {
    const diff = stack.processing.owner.field.length * 500;
    stack.processing.owner.field.forEach(unit => {
      if (unit.delta.some(delta => delta.source?.unit === stack.processing.id)) {
        const delta = unit.delta.find(delta => delta.source?.unit === stack.processing.id);
        if (delta?.effect.type === 'bp') delta.effect.diff = diff;
      } else {
        Effect.modifyBP(stack, stack.processing, unit, diff, {
          source: { unit: stack.processing.id },
        });
      }
    });
  },
};
