import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (!stack.processing.owner.purple || stack.processing.owner.purple <= 2) {
      await System.show(
        stack,
        '満月の護り&秩序の盾',
        '捨札からユニットを回収\n紫ゲージ+1\n対戦相手の効果によってダメージを受けない'
      );
      const [target] = EffectHelper.random(
        stack.processing.owner.trash.filter(
          card => card instanceof Unit && card.catalog.color === Color.PURPLE
        ),
        1
      );
      if (target) Effect.move(stack, stack.processing, target, 'hand');
      await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
    } else {
      await System.show(stack, '秩序の盾', '対戦相手の効果によってダメージを受けない');
    }
    Effect.keyword(stack, stack.processing, stack.processing, '秩序の盾');
  },
};
