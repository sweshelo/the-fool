import type { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '封神太極陣＆固着', 'BP+1000\n手札に戻らない');
    Effect.keyword(stack, stack.processing, stack.processing, '固着');
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    // 封神太極陣
    const owner = stack.processing.owner;

    owner.field.forEach(unit => {
      // 既にこのユニットが発行したDeltaが存在するか確認
      const delta = unit.delta.find(
        d => d.source?.unit === stack.processing.id && d.source?.effectCode === '封神太極陣'
      );

      if (!delta) {
        // 新しいDeltaを発行
        Effect.modifyBP(stack, stack.processing, unit, 1000, {
          source: {
            unit: stack.processing.id,
            effectCode: '封神太極陣',
          },
        });
      }
    });
  },

  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '討神義牙', '【貫通】を得る');
    Effect.keyword(stack, stack.processing, stack.processing, '貫通');
  },

  onPlayerAttackSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '脈打つ魂魄', 'CP+1');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
  },
};
