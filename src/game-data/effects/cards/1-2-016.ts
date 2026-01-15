import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '闘士／神', '【神】1体につきBP+4000');
  },

  // 闘士／神：フィールドの【神】1体につき+4000される
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    // すでに自身が発行したDeltaがあるか確認
    const delta = stack.processing.delta.find(
      delta => delta.source?.unit === stack.processing.id && delta.source?.effectCode === '闘士／神'
    );

    // フィールドにいる【神】ユニットの数をカウント
    const godCount = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('神')
    ).length;

    // BP増加量を計算
    const bpBoost = godCount * 4000;

    if (delta && delta.effect.type === 'bp') {
      // Deltaを更新
      delta.effect.diff = bpBoost;
    } else {
      // 新規にDeltaを生成
      Effect.modifyBP(stack, stack.processing, stack.processing, bpBoost, {
        source: {
          unit: stack.processing.id,
          effectCode: '闘士／神',
        },
      });
    }
  },
};
