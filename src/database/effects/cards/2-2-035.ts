import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    return (
      owner.id === stack.source.id &&
      Array.from(new Set(owner.field.map(card => card.catalog.color))).length >= 3 &&
      owner.hand.length >= 2
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '月虹のささめき', '手札を2枚選んで捨てる\nデッキから2枚選んで引く');
    const owner = stack.processing.owner;
    const discardChoices: Choices = {
      title: '捨てるカードを選択してください',
      type: 'card',
      items: owner.hand,
      count: 2,
    };
    const discards = await System.prompt(stack, owner.id, discardChoices);
    const discardTarget = owner.hand.filter(card => discards.includes(card.id));
    if (!discardTarget || discardTarget.length !== discards.length)
      throw new Error('正しいカードが選択されませんでした');

    const drawChoices: Choices = {
      title: '手札に加えるカードを選択してください',
      type: 'card',
      items: owner.deck,
      count: 2,
    };
    const draws = await System.prompt(stack, owner.id, drawChoices);
    const drawTarget = owner.deck.filter(card => draws.includes(card.id));
    if (!drawTarget || draws.length !== drawTarget.length)
      throw new Error('正しいカードが選択されませんでした');

    discardTarget.forEach(card => Effect.handes(stack, stack.processing, card));
    drawTarget.forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
  },
};
