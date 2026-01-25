import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  // 【加護】
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'サポーター／神獣＆加護', '【神獣】のBP+1000\n効果に選ばれない');
    Effect.keyword(stack, stack.processing, stack.processing, '加護');
  },

  // ■サポーター／神獣
  // あなたの【神獣】ユニットのBPを+1000する。
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      targets: ['owns'],
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.modifyBP(stack, stack.processing, unit, 1000, { source });
        }
      },
      effectCode: 'サポーター／神獣',
      condition: target => target.catalog.species?.includes('神獣') ?? false,
    });
  },
};
