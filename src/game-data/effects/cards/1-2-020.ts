import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  // ■女神の慈愛
  // あなたのレベル1ユニットに【加護】を与える。

  // 召喚時の効果表示
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '女神の慈愛', 'レベル1ユニットに【加護】を付与');
  },

  // フィールド効果：レベル1ユニットに加護を与える
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.keyword(stack, stack.processing, target, '加護', { source });
      },
      effectCode: '女神の慈愛',
      targets: ['owns'],
      condition: target => target.lv === 1,
    });
  },
};
