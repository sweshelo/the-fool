import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkTurnStart: stack =>
    stack.processing.owner.id === stack.source.id && stack.processing.owner.hand.length > 0,
  onTurnStart: async (stack: StackWithCard) => {
    await System.show(stack, '加速装置', 'CP+1');
    const [target] = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      stack.processing.owner.hand,
      '捨てるカードを選んで下さい'
    );
    Effect.handes(stack, stack.processing, target);
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
  },
};
