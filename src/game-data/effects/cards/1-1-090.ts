import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard): boolean => {
    // Make sure processing is defined
    if (!stack.processing) throw new Error('Stack processing is undefined');

    const isOwnUnit = stack.source.id === stack.processing.owner.id;
    const hasHand = stack.processing.owner.hand.length > 0;
    const isRemainDeck = stack.processing.owner.deck.length > 0;
    return isOwnUnit && isRemainDeck && (stack.processing.lv >= 3 || hasHand);
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard) => {
    // Make sure processing is defined
    if (!stack.processing) throw new Error('Stack processing is undefined');

    const owner = stack.processing.owner;

    if (stack.processing.lv <= 2) {
      await System.show(stack, '無限の魔法石', '手札を1枚選んで捨てる\nデッキから1枚選んで引く');
      const discardChoices: Choices = {
        title: '捨てるカードを選択してください',
        type: 'card',
        items: owner.hand,
        count: 1,
      };
      const [discard] = await System.prompt(stack, owner.id, discardChoices);
      const discardTarget = owner.hand.find(card => card.id === discard);
      if (!discardTarget) throw new Error('正しいカードが選択されませんでした');
      Effect.break(stack, stack.processing, discardTarget);
    } else {
      await System.show(stack, '無限の魔法石', 'デッキから1枚選んで引く');
    }

    const drawChoices: Choices = {
      title: '手札に加えるカードを選択してください',
      type: 'card',
      items: owner.deck,
      count: 1,
    };
    const [draw] = await System.prompt(stack, owner.id, drawChoices);
    const drawTarget = owner.deck.find(card => card.id === draw);
    if (!drawTarget) throw new Error('正しいカードが選択されませんでした');
    Effect.move(stack, stack.processing, drawTarget, 'hand');
  },
};
