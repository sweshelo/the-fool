import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■前線突破
  // このユニットのBPは+［お互いのトリガーゾーンにあるカードの数×1000］される。

  // フィールド効果
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    const self = stack.processing;
    const owner = self.owner;
    const opponent = owner.opponent;

    // お互いのトリガーゾーンにあるカードの数
    const triggerCount = owner.trigger.length + opponent.trigger.length;

    // BPの増加量
    const bpIncrease = triggerCount * 1000;

    // 既にこのユニットが発行したDeltaが存在するか確認
    const delta = self.delta.find(
      delta => delta.source?.unit === self.id && delta.source?.effectCode === '前線突破'
    );

    if (delta && delta.effect.type === 'bp') {
      // 既存のDeltaを更新
      delta.effect.diff = bpIncrease;
    } else {
      // 新しいDeltaを発行
      Effect.modifyBP(stack, self, self, bpIncrease, {
        source: { unit: self.id, effectCode: '前線突破' },
      });
    }
  },

  // 召喚時のテキスト表示
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '前線突破', 'BP+[お互いのトリガーゾーンのカード数×1000]');
  },
};
