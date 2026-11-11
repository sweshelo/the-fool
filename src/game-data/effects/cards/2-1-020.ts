import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

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
      Effect.modifyCP(
        stack,
        stack.processing,
        stack.processing.owner,
        Math.min(unit.catalog.cost, 7)
      );
    });
  },

  fieldEffect: (stack: StackWithCard) => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit) {
          Effect.dynamicBP(
            stack,
            stack.processing,
            target,
            target => target.owner.field.length * 500,
            { source }
          );
        }
      },
      effectCode: '万物共鳴',
      targets: ['owns'],
    });
  },
};
