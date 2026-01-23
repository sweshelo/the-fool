import { Effect, System } from '..';
import { PermanentEffect } from '../engine/permanent';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(
      stack,
      '大地の掟＆豊穣の女神',
      '【秩序の盾】を得る\nレベル2以上の味方のBP+2000\nレベル3以上の味方に【不屈】を与える'
    );
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    // 大地の掟
    PermanentEffect.mount(stack.processing, {
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.keyword(stack, stack.processing, unit, '秩序の盾', {
            source,
          });
        }
      },
      targets: ['self'],
      effectCode: '大地の掟',
    });

    // 豊穣の女神
    PermanentEffect.mount(stack.processing, {
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.modifyBP(stack, stack.processing, unit, 2000, { source });
        }
      },
      targets: ['owns'],
      condition: unit => unit.lv >= 2,
      effectCode: '豊穣の女神_Lv2',
    });

    PermanentEffect.mount(stack.processing, {
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.keyword(stack, stack.processing, unit, '不屈', { source });
        }
      },
      targets: ['owns'],
      condition: unit => unit.lv >= 3,
      effectCode: '豊穣の女神_Lv3',
    });
  },
};
