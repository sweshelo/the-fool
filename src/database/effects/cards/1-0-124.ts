import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard): boolean => {
    const isOwnUnit = stack.source.id === stack.processing.owner.id;
    const hasMoreThan2Hand = stack.processing.owner.hand.length > 2;

    return isOwnUnit && hasMoreThan2Hand;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'ライトステップ', '2枚選んで捨てる\nカードを3枚引く');
    const choices: Choices = {
      title: '捨てるカードを選択してください',
      type: 'card',
      items: stack.processing.owner.hand,
      count: 2,
    };

    const targets = (await System.prompt(stack, stack.processing.owner.id, choices))
      .map(id => stack.processing.owner.hand.find(card => card.id === id))
      .filter(card => card !== undefined);
    targets.forEach(card => Effect.handes(stack, stack.processing, card));

    [...Array(3)].forEach(() => EffectTemplate.draw(stack.processing.owner, stack.core));
  },
};
