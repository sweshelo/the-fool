import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  // 【貫通】
  // （このユニットの攻撃は対戦相手のユニットを貫通して対戦相手にライフダメージを与える。この能力はこのユニットがフィールドに出た時に付与される）
  // サポーター／昆虫
  // あなたの【昆虫】ユニットのBPを+1000する。

  // 召喚時に貫通を付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'サポーター／昆虫＆貫通', '【昆虫】のBP+1000');
    Effect.keyword(stack, stack.processing, stack.processing, '貫通');
  },

  // フィールド効果：昆虫ユニットのBPを+1000する
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    // 自身も含む、自分のフィールド上の昆虫ユニットを対象にする
    stack.processing.owner.field.forEach(unit => {
      if (unit.catalog.species?.includes('昆虫')) {
        // 既にこのユニットが発行したDeltaが存在するか確認
        const delta = unit.delta.find(
          d => d.source?.unit === stack.processing.id && d.source?.effectCode === 'サポーター／昆虫'
        );

        if (delta && delta.effect.type === 'bp') {
          // Deltaを編集する
          delta.effect.diff = 1000;
        } else {
          // 新しいDeltaを追加
          unit.delta.push(
            new Delta(
              { type: 'bp', diff: 1000 },
              {
                source: {
                  unit: stack.processing.id,
                  effectCode: 'サポーター／昆虫',
                },
              }
            )
          );
        }
      }
    });
  },
};
