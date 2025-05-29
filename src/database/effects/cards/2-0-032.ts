import type { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '実験スタート！', '【魔道士】を1枚引く\n紫ゲージ+1');
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '魔導士' });
  },
};
