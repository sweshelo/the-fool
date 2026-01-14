import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkTurnEnd: (stack: StackWithCard) => {
    return stack.processing.owner.id === stack.source.id && stack.processing.owner.deck.length >= 5;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '選ばれし者', 'デッキから5枚見る\n1枚を手札に加える\n残りは消滅');
    const deck = stack.processing.owner.deck;

    const selectedCards = deck.slice(0, 5);
    const choices: Choices = {
      title: '手札に加えるカードを選択してください',
      type: 'card',
      items: selectedCards,
      count: 1,
    };
    const [cardId] = await System.prompt(stack, stack.processing.owner.id, choices);
    const card = selectedCards.find(card => card.id === cardId);

    if (!card) throw new Error('正しいカードが選択されませんでした');
    selectedCards.forEach(card => {
      Effect.move(stack, stack.processing, card, card.id === cardId ? 'hand' : 'delete');
    });
  },
};
