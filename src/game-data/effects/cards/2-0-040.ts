import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '闇との契約', 'インターセプトカードを1枚引く\n紫ゲージ+1');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
  },

  // アタック時効果
  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    if ((stack.processing.owner.purple ?? 0) <= 2) {
      await System.show(stack, '背徳の円舞曲', '紫ゲージ+1');
      await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
    }
  },
};
