import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onBreakSelf: async (stack: StackWithCard) => {
    await System.show(stack, '幼竜の叫び', 'インターセプトカードを捨札から1枚回収\n紫ゲージ+1');
    EffectHelper.random(
      stack.processing.owner.trash.filter(card => card.catalog.type === 'intercept'),
      1
    ).forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
    Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
  },
};
