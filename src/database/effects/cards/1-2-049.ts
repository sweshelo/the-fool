import { Delta } from '@/package/core/class/delta';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(
      stack,
      '大地の掟＆豊穣の女神',
      '【秩序の盾】を得る\nレベル2以上の味方のBP+2000\nレベル3以上の味方に【不屈】を与える'
    );
  },

  // FIXME: クロックアップの直後？など、効果が一時的に無効になる事がある
  fieldEffect: (stack: StackWithCard) => {
    stack.processing.owner.field.forEach(unit => {
      // 大地の掟
      if (unit.id === stack.processing.id) {
        if (
          unit.delta.some(
            delta => delta.source?.unit === unit.id && delta.source.effectCode === '大地の掟'
          )
        ) {
          if (unit.lv !== 1)
            unit.delta = unit.delta.filter(
              delta => delta.source?.unit === unit.id && delta.source.effectCode === '大地の掟'
            );
        } else {
          if (unit.lv === 1 && stack.processing instanceof Unit) {
            Effect.keyword(stack, stack.processing, stack.processing, '秩序の盾', {
              source: { unit: stack.processing.id, effectCode: '大地の掟' },
            });
          }
        }
      }

      // 豊穣の女神_Lv3
      if (
        unit.delta.some(
          delta =>
            delta.source?.unit === stack.processing.id &&
            delta.source.effectCode === '豊穣の女神_Lv3'
        )
      ) {
        // 発動中で条件外ならば取り除く
        if (unit.lv < 3) {
          unit.delta = unit.delta.filter(
            delta =>
              !(
                delta.source?.unit === stack.processing.id &&
                delta.source.effectCode === '豊穣の女神_Lv3'
              )
          );
        }
      } else {
        // 非発動中で条件内ならば付与する
        if (unit.lv >= 3)
          Effect.keyword(stack, stack.processing, unit, '不屈', {
            source: { unit: stack.processing.id, effectCode: '豊穣の女神_Lv3' },
          });
      }

      if (
        unit.delta.some(
          delta =>
            delta.source?.unit === stack.processing.id &&
            delta.source.effectCode === '豊穣の女神_Lv2'
        )
      ) {
        if (unit.lv < 2)
          unit.delta = unit.delta.filter(
            delta =>
              !(
                delta.source?.unit === stack.processing.id &&
                delta.source.effectCode === '豊穣の女神_Lv2'
              )
          );
      } else {
        if (unit.lv >= 2)
          unit.delta.push(
            new Delta({ type: 'bp', diff: 2000 }, undefined, undefined, undefined, {
              unit: stack.processing.id,
              effectCode: '豊穣の女神_Lv2',
            })
          );
      }
    });
  },
};
