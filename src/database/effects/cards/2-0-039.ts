import type { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '清麗の飛燕', 'ブロックされない');
  },

  onPlayerAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (!stack.processing.owner.purple || stack.processing.owner.purple <= 0) {
      await System.show(stack, '奥義・紫燕返し', '行動権を回復\n紫ゲージ+2');
      Effect.activate(stack, stack.processing, stack.processing, true);
      await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 2);
    }
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    // 既にこのユニットが発行したDeltaが存在するか確認
    const delta = stack.processing.delta.find(d => d.source?.unit === stack.processing.id);

    if (!stack.processing.owner.purple || stack.processing.owner.purple <= 0) {
      // 紫ゲージが0で、次元干渉を持っていなければ付与
      if (!delta) {
        Effect.keyword(stack, stack.processing, stack.processing, '次元干渉', {
          cost: 0,
          source: { unit: stack.processing.id },
        });
      }
    } else {
      // 紫ゲージが0より大の場合、このユニットが付与した次元干渉を削除
      if (delta) {
        stack.processing.delta = stack.processing.delta.filter(
          d => !(d.source?.unit === stack.processing.id)
        );
      }
    }
  },
};
