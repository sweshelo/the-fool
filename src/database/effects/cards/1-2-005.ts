import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';

export const effects: CardEffects = {
  // ■増殖
  // このユニットのBPはあなたのフィールドの【昆虫】ユニット1体につき+2000される。
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    // プレイヤーのフィールド上の昆虫ユニット数を数える
    const insectCount = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('昆虫')
    ).length;

    // BP増加量を計算（昆虫1体につき+2000）
    const bpBoost = insectCount * 2000;

    // 既にこのユニットが発行したDeltaが存在するか確認
    const delta = stack.processing.delta.find(
      d => d.source?.unit === stack.processing.id && d.source?.effectCode === '増殖'
    );

    if (delta && delta.effect.type === 'bp') {
      // Deltaを編集する
      delta.effect.diff = bpBoost;
    } else {
      // 新しいDeltaを追加
      Effect.modifyBP(stack, stack.processing, stack.processing, bpBoost, {
        source: { unit: stack.processing.id },
      });
    }
  },

  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '増殖', 'BP+[【昆虫】×2000]');
  },
};
