import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '世界の真理', '【固着】\nコスト2以下に【攻撃禁止】を与える');
    Effect.keyword(stack, stack.processing, stack.processing, '固着');
  },

  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      await System.show(stack, '生命の育み', '基本BP+2000');
      Effect.modifyBP(stack, stack.processing, stack.processing, 2000, { isBaseBP: true });
    }
  },

  onWinSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '愉悦の杯', 'CP+1');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
  },

  fieldEffect: (stack: StackWithCard) => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit) {
          Effect.keyword(stack, stack.processing, target, '攻撃禁止', { source });
        }
      },
      condition: target => target.catalog.cost <= 2,
      effectCode: '世界の真理',
      targets: ['opponents'],
    });
  },
};
