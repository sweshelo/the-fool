import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkTurnEnd: stack =>
    stack.processing.owner.field.length <= 0 && stack.source.id !== stack.processing.owner.id,
  onTurnEnd: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const triggerCards = owner.trash.filter(card => card.catalog.type === 'trigger');
    await System.show(stack, 'シャドーミラー', 'トリガーカードを2枚回収');
    EffectHelper.random(triggerCards, 2).forEach(card =>
      Effect.move(stack, stack.processing, card, 'hand')
    );
  },
};
