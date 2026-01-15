import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import { EffectTemplate } from '../engine/templates';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkTurnStart: stack =>
    stack.source.id === stack.processing.owner.id && stack.processing.owner.hand.length > 0,
  onTurnStart: async (stack: StackWithCard) => {
    await System.show(
      stack,
      '雄大なる間欠泉',
      '手札をすべて捨てる\n手札が7枚になるまでカードを引く'
    );
    stack.processing.owner.hand.forEach(card => Effect.handes(stack, stack.processing, card));
    while (stack.processing.owner.hand.length < 7)
      EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
