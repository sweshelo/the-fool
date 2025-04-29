import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: async (stack: StackWithCard): Promise<boolean> => {
    const isOwnUnit =
      EffectHelper.owner(stack.core, stack.source).id ===
      EffectHelper.owner(stack.core, stack.processing).id;
    const hasMoreThan2Hand = EffectHelper.owner(stack.core, stack.processing).hand.length > 2;

    return isOwnUnit && hasMoreThan2Hand;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = EffectHelper.owner(stack.core, stack.processing);

    await System.show(stack, 'ライトステップ', '2枚選んで捨てる\nカードを3枚引く');
    const choices: Choices = {
      title: '捨てるカードを選択してください',
      type: 'card',
      items: owner.hand,
      count: 2,
    };

    const targets = (await System.prompt(stack, owner.id, choices))
      .map(id => owner.hand.find(card => card.id === id))
      .filter(card => card !== undefined);
    targets.forEach(card => Effect.handes(stack, stack.processing, card));

    [...Array(3)].forEach(() => EffectTemplate.draw(owner, stack.core));
  },
};
