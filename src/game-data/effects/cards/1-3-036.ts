import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      'インフィニット・フォース',
      '【秩序の盾】\n【英雄】に【不屈】を与える\n味方全体のBP+2000'
    );
    Effect.keyword(stack, stack.processing, stack.processing, '秩序の盾');
  },

  fieldEffect: (stack: StackWithCard<Unit>): void => {
    // 全てのユニットのBPを+2000
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.modifyBP(stack, stack.processing, target, 2000, { source });
      },
      effectCode: 'インフィニット・フォース',
      targets: ['owns'],
    });

    // 【英雄】ユニットに【不屈】を与える
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.keyword(stack, stack.processing, target, '不屈', { source });
      },
      effectCode: 'インフィニット・フォース・英雄',
      targets: ['owns'],
      condition: target => target instanceof Unit && target.catalog.species?.includes('英雄'),
    });
  },

  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    await System.show(stack, 'ヒロイック・コマンド', '味方全体に【貫通】を与える');

    // 全てのユニットに【貫通】を与える
    owner.field.forEach(unit => {
      Effect.keyword(stack, stack.processing, unit, '貫通');
    });
  },
};
