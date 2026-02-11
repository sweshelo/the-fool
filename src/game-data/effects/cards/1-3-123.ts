import { Effect, EffectHelper, System } from '..';
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
    const [selected] = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      selectedCards,
      '手札に加えるカードを選択してください'
    );

    selectedCards.forEach(card => {
      Effect.move(stack, stack.processing, card, card.id === selected.id ? 'hand' : 'delete');
    });
  },
};
