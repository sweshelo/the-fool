import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkAttack: async (stack: StackWithCard) => {
    return (
      stack.processing.owner.id !== stack.source.id &&
      stack.processing.owner.field.length <= 4 &&
      !!stack.processing.owner.trash.find(
        card => card.catalog.type === 'unit' && card.catalog.cost <= 1
      )
    );
  },

  onAttack: async (stack: StackWithCard) => {
    const [target] = EffectHelper.random(
      stack.processing.owner.trash.filter(
        card => card.catalog.type === 'unit' && card.catalog.cost <= 1
      )
    );
    if (!(target instanceof Unit)) throw new Error('2-1-031: 不正なTarget');
    await System.show(stack, 'レトロゲーム', '捨札からコスト1以下を【特殊召喚】');
    await Effect.summon(stack, stack.processing, target);
  },
};
