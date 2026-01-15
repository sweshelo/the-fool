import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkAttack: (stack: StackWithCard) => {
    return (
      stack.processing.owner.id === stack.source.id &&
      stack.processing.owner.deck.length >= 5 &&
      stack.target instanceof Unit &&
      !!stack.target.catalog.species?.includes('悪魔')
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onAttack: async (stack: StackWithCard): Promise<void> => {
    await System.show(
      stack,
      '華麗なる一族',
      'デッキから5枚見る\n1枚をトリガーゾーンにセット\n残りは捨札に送る'
    );
    const deck = stack.processing.owner.deck;

    const selectedCards = deck.slice(0, 5);
    const [target] = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      selectedCards,
      'トリガーゾーンにセットするカードを選んで下さい'
    );

    selectedCards.forEach(card => {
      Effect.move(stack, stack.processing, card, card.id === target.id ? 'trigger' : 'trash');
    });

    if (stack.target instanceof Unit)
      Effect.modifyBP(stack, stack.processing, stack.target, 2000, { event: 'turnEnd', count: 1 });
  },
};
