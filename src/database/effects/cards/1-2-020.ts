import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■女神の慈愛
  // あなたのレベル1ユニットに【加護】を与える。

  // 召喚時の効果表示
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '女神の慈愛', 'レベル1ユニットに【加護】を付与');
  },

  // フィールド効果：レベル1ユニットに加護を与える
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    const owner = stack.processing.owner;

    // 自分のフィールドにあるレベル1のユニットを対象にする
    owner.field.forEach(unit => {
      // レベル1のユニットか確認
      if (unit.lv === 1) {
        // 既にこのユニットが発行したDeltaが存在するか確認
        const delta = unit.delta.find(
          d => d.source?.unit === stack.processing.id && d.source?.effectCode === '女神の慈愛'
        );

        // 既にDeltaが存在しない場合のみ加護を付与
        if (!delta) {
          Effect.keyword(stack, stack.processing, unit, '加護', {
            source: { unit: stack.processing.id, effectCode: '女神の慈愛' },
          });
        }
      } else {
        // レベル1でなくなった場合、このユニットが付与した加護を削除
        unit.delta = unit.delta.filter(
          d => !(d.source?.unit === stack.processing.id && d.source?.effectCode === '女神の慈愛')
        );
      }
    });
  },
};
