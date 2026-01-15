import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';

export const effects: CardEffects = {
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    // プレイヤーのフィールド上の機械ユニット数を数える
    const insectCount = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('機械')
    ).length;

    const bpBoost = insectCount * 1000;

    stack.processing.owner.field
      .filter(unit => unit.catalog.species?.includes('機械'))
      .forEach(unit => {
        // 既にこのユニットが発行したDeltaが存在するか確認
        const delta = unit.delta.find(d => d.source?.unit === stack.processing.id);

        if (delta && delta.effect.type === 'bp') {
          // Deltaを編集する
          delta.effect.diff = bpBoost;
        } else {
          // 新しいDeltaを追加
          Effect.modifyBP(stack, stack.processing, unit, bpBoost, {
            source: { unit: stack.processing.id },
          });
        }
      });
  },

  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'サポーター／機械', 'BP+[【機械】×1000]');
  },
};
