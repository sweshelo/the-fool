import { Card } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  // インターセプト: 対戦相手のトリガーカードの効果が発動した時
  checkTrigger: (stack: StackWithCard<Card>): boolean => {
    return (
      stack.processing.owner.opponent.id === stack.source.id &&
      stack.target instanceof Card &&
      stack.target.catalog.type === 'trigger'
    );
  },

  onTrigger: async (stack: StackWithCard<Card>): Promise<void> => {
    const owner = stack.processing.owner;
    const triggers = owner.trash.filter(card => card.catalog.type === 'trigger');

    if (triggers.length > 0) {
      const toAdd = EffectHelper.random(triggers, 2);
      await System.show(stack, '鏡の盾', 'トリガーカードを2枚回収');

      for (const card of toAdd) {
        Effect.move(stack, stack.processing, card, 'hand');
      }
    }
  },

  // インターセプト: 対戦相手のインターセプトカードの効果が発動した時
  checkIntercept: (stack: StackWithCard<Card>): boolean => {
    return (
      stack.processing.owner.opponent.id === stack.source.id &&
      stack.target instanceof Card &&
      stack.target.catalog.type === 'intercept'
    );
  },

  onIntercept: async (stack: StackWithCard<Card>): Promise<void> => {
    const owner = stack.processing.owner;
    const intercepts = owner.trash.filter(card => card.catalog.type === 'intercept');

    if (intercepts.length > 0) {
      const toAdd = EffectHelper.random(intercepts, 2);
      await System.show(stack, '鏡の盾', 'インターセプトカードを2枚回収');

      for (const card of toAdd) {
        Effect.move(stack, stack.processing, card, 'hand');
      }
    }
  },
};
