import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onBreakSelf: async (stack: StackWithCard) => {
    const targets = EffectHelper.random(
      stack.processing.owner.trash.filter(card => card.catalog.type === 'intercept'),
      1
    );
    if (targets.length > 0) {
      await System.show(stack, '幼竜の叫び', 'インターセプトカードを捨札から1枚回収\n紫ゲージ+1');
      targets.forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
    } else {
      await System.show(stack, '幼竜の叫び', '紫ゲージ+1');
    }
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
  },
};
