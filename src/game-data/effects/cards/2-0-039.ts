import type { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

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
    // 紫ゲージが0のとき、次元干渉を付与
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) =>
        Effect.keyword(stack, stack.processing, stack.processing, '次元干渉', {
          condition: () => true,
          source,
        }),
      condition: target => target.owner.purple === 0,
      targets: ['self'],
      effectCode: '清麗の飛燕',
    });
  },
};
