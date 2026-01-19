import { Effect, PermanentEffect, System, type DeltaSourceOption } from '..';
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
    // 豊穣の女神_Lv3: Lv3以上の味方ユニットに【不屈】を付与
    PermanentEffect.mount(stack, stack.processing, {
      targets: ['owns'],
      effect: (unit: Unit, option: DeltaSourceOption) =>
        Effect.keyword(stack, stack.processing, unit, '不屈', option),
      condition: (unit: Unit) => unit.lv >= 3,
      effectCode: '豊穣の女神_Lv3',
    });

    // 豊穣の女神_Lv2: Lv2以上の味方ユニットにBP+2000
    PermanentEffect.mount(stack, stack.processing, {
      targets: ['owns'],
      effect: (unit: Unit, option: DeltaSourceOption) =>
        Effect.modifyBP(stack, stack.processing, unit, 2000, option),
      condition: (unit: Unit) => unit.lv >= 2,
      effectCode: '豊穣の女神_Lv2',
    });

    // 大地の掟: Lv1の自分自身に【秩序の盾】を付与
    PermanentEffect.mount(stack, stack.processing, {
      targets: ['self'],
      effect: (unit: Unit, option: DeltaSourceOption) =>
        Effect.keyword(stack, stack.processing, unit, '秩序の盾', option),
      condition: (unit: Unit) => unit.lv === 1,
      effectCode: '大地の掟',
    });
  },
};
