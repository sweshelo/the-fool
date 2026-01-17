import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import { EffectTemplate } from '../engine/templates';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkDrive: stack =>
    stack.processing.owner.deck.length >= 3 && stack.source.id === stack.processing.owner.id,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, 'デスパレート', 'デッキから3枚捨てる\nインターセプトカードを1枚引く');
    (
      await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        stack.processing.owner.deck,
        '捨てるカードを選んで下さい',
        3
      )
    ).forEach(card => Effect.move(stack, stack.processing, card, 'trash'));
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
  },
};
