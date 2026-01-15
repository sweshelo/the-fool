import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

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
    const owner = stack.processing.owner;

    // 全てのユニットのBPを+2000
    owner.field.forEach(unit => {
      // 既にこのユニットが発行したDeltaが存在するか確認
      const delta = unit.delta.find(
        d =>
          d.source?.unit === stack.processing.id &&
          d.source?.effectCode === 'インフィニット・フォース'
      );

      if (!delta) {
        // 新しいDeltaを発行
        Effect.modifyBP(stack, stack.processing, unit, 2000, {
          source: { unit: stack.processing.id, effectCode: 'インフィニット・フォース' },
        });
      }
    });

    // 【英雄】ユニットに【不屈】を与える
    owner.field.forEach(unit => {
      if (unit.catalog.species?.includes('英雄')) {
        // 既にこのユニットが発行したDeltaが存在するか確認
        const delta = unit.delta.find(
          d =>
            d.source?.unit === stack.processing.id &&
            d.source?.effectCode === 'インフィニット・フォース_不屈'
        );

        // Deltaが存在しない場合のみ不屈を付与
        if (!delta) {
          Effect.keyword(stack, stack.processing, unit, '不屈', {
            source: { unit: stack.processing.id, effectCode: 'インフィニット・フォース_不屈' },
          });
        }
      }
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
