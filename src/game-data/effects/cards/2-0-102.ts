import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  // ■前線突破
  // このユニットのBPは+［お互いのトリガーゾーンにあるカードの数×1000］される。

  // フィールド効果
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) =>
        Effect.dynamicBP(
          stack,
          stack.processing,
          stack.processing,
          self => (self.owner.trigger.length + self.owner.opponent.trigger.length) * 1000,
          { source }
        ),
      targets: ['self'],
      effectCode: '前線突破',
    });
  },

  // 召喚時のテキスト表示
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '前線突破', 'BP+[お互いのトリガーゾーンのカード数×1000]');
  },
};
