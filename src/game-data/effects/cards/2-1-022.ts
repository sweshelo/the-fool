import { Unit } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■深森の道標
  // このユニットがアタックした時、あなたはインターセプトカードを１枚引く。
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '深森の道標', 'インターセプトカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
  },

  // ■魔導の集い
  // このユニットが破壊された時、あなたは【魔導士】ユニットのカードを１枚ランダムで手札に加える。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '魔導の集い', '【魔導士】ユニットを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '魔導士' });
  },
};
