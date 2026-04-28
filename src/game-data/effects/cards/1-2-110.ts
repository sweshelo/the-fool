import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

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
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.keyword(stack, stack.processing, target, '加護', { source });
      },
      targets: ['owns'],
      condition: target => target instanceof Unit && target.catalog.species?.includes('巨人'),
      effectCode: '煌めく筋肉',
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
