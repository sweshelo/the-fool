import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■煌めく筋肉
  // あなたのフィールドの【巨人】ユニットに【加護】を与える。
  // ■ビルドガード
  // あなたのユニットがブロックするたび、ターン終了時までこのユニットのBPを+1000する。

  // 召喚時の効果表示
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '煌めく筋肉', '【巨人】に【加護】を付与');
  },

  // フィールド効果：巨人ユニットに加護を与える
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    const owner = stack.processing.owner;

    // 自分のフィールドの巨人ユニットを対象にする
    owner.field.forEach(unit => {
      // 巨人ユニットか確認
      if (unit.catalog.species?.includes('巨人')) {
        // 既にこのユニットが発行したDeltaが存在するか確認
        const delta = unit.delta.find(
          d => d.source?.unit === stack.processing.id && d.source?.effectCode === '煌めく筋肉'
        );

        // 既にDeltaが存在しない場合のみ加護を付与
        if (!delta) {
          Effect.keyword(stack, stack.processing, unit, '加護', {
            source: { unit: stack.processing.id, effectCode: '煌めく筋肉' },
          });
        }
      } else {
        // 巨人でなくなった場合、このユニットが付与した加護を削除
        unit.delta = unit.delta.filter(
          d => !(d.source?.unit === stack.processing.id && d.source?.effectCode === '煌めく筋肉')
        );
      }
    });
  },

  // ブロック時の効果
  onBlock: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分のユニットがブロックした時のみ発動
    if (stack.target instanceof Unit && stack.target.owner.id === owner.id) {
      await System.show(stack, 'ビルドガード', 'BP+1000');

      // BP+1000（ターン終了時まで）
      Effect.modifyBP(stack, stack.processing, stack.processing, 1000, {
        event: 'turnEnd',
        count: 1,
      });
    }
  },
};
