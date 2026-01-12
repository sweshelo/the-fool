import type { Card } from '@/package/core/class/card';
import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  // あなたのユニットがフィールドに出た時
  checkDrive: (stack: StackWithCard<Card>): boolean => {
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.processing.owner.opponent.hand.length > 0
    );
  },

  onDrive: async (stack: StackWithCard<Card>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(stack, '迷子センター', '手札を1枚破壊\n相手が捨札からランダムで1枚回収');

    let selectedCard: Card | undefined;
    if (opponent.hand.length > 0) {
      const [selected] = await EffectHelper.selectCard(
        stack,
        owner,
        opponent.hand,
        '破壊するカードを選択してください'
      );
      selectedCard = selected;
    }

    if (opponent.trash.length > 0) {
      const [card] = EffectHelper.random(opponent.trash, 1);
      if (card) Effect.move(stack, stack.processing, card, 'hand');
    }

    if (selectedCard) Effect.handes(stack, stack.processing, selectedCard);
  },
};
