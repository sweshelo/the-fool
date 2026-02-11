import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard): boolean => {
    const isOwnUnit = stack.source.id === stack.processing.owner.id;
    const hasAtLeast2Hand = stack.processing.owner.hand.length >= 2;

    return isOwnUnit && hasAtLeast2Hand;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'ライトステップ', '2枚選んで捨てる\nカードを3枚引く');

    const targets = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      stack.processing.owner.hand,
      '捨てるカードを選択してください',
      2
    );
    targets.forEach(card => Effect.break(stack, stack.processing, card));

    [...Array(3)].forEach(() => EffectTemplate.draw(stack.processing.owner, stack.core));
  },
};
