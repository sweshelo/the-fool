import type { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const hasCP = stack.processing.owner.opponent.cp.current > 0;
    await System.show(stack, 'ブラックレイダー', `【盗賊】を1枚引く${hasCP ? '\nCP-12' : ''}`);

    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '盗賊' });
    Effect.modifyCP(stack, stack.processing, stack.processing.owner.opponent, -12);
  },
};
