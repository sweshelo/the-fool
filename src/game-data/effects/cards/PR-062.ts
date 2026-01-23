import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onOverclockSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(
      stack,
      'ARCANA空間突破旅行',
      '味方全体を消滅\n手札を全て捨てる\nCP+7\n手札が7枚になるまでカードを引く'
    );
    stack.processing.owner.field.forEach(unit => Effect.delete(stack, stack.processing, unit));
    stack.processing.owner.hand.forEach(card => Effect.break(stack, stack.processing, card));
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 7);
    [...Array(7)].forEach(() => EffectTemplate.draw(stack.processing.owner, stack.core));
  },
};
