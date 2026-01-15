import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // このユニットのBPは+［あなたのライフ×1000］される。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '正統なる血統', 'BP+[ライフ×1000]');
  },

  fieldEffect: (stack: StackWithCard<Unit>): void => {
    const self = stack.processing;
    const owner = self.owner;

    // 現在のライフに基づくBP増加量
    const bpIncrease = owner.life.current * 1000;

    // 既にこのユニットが発行したDeltaが存在するか確認
    const delta = self.delta.find(
      delta => delta.source?.unit === self.id && delta.source?.effectCode === '正統なる血統'
    );

    if (delta && delta.effect.type === 'bp') {
      // 既存のDeltaを更新
      delta.effect.diff = bpIncrease;
    } else {
      // 新しいDeltaを発行
      Effect.modifyBP(stack, self, self, bpIncrease, {
        source: { unit: self.id, effectCode: '正統なる血統' },
      });
    }
  },
};
