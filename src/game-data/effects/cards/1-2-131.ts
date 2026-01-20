import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    return stack.processing.owner.id === stack.source.id;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '女神の詩', '【神】ユニットを1枚引く');
    EffectHelper.random(
      stack.processing.owner.deck.filter(card => card.catalog.species?.includes('神'))
    ).forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
  },

  checkBreak: (stack: StackWithCard) => {
    return (
      stack.target instanceof Unit &&
      stack.processing.owner.id === stack.target.owner.id &&
      (stack.target.catalog.species?.includes('神') ?? false)
    );
  },

  onBreak: async (stack: StackWithCard) => {
    if (stack.target instanceof Unit) {
      await System.show(stack, '女神の詩', '【神】ユニットを手札に戻す');
      Effect.bounce(stack, stack.processing, stack.target, 'hand');
    }
  },
};
