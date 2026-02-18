import { Effect, EffectHelper, System } from '..';
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

    if (stack.processing.lv <= 2) {
      await System.show(stack, '無限の魔法石', '手札を1枚選んで捨てる\nデッキから1枚選んで引く');
      const [discard] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        stack.processing.owner.hand,
        '捨てるカードを選択してください'
      );
      Effect.break(stack, stack.processing, discard);
    } else {
      await System.show(stack, '無限の魔法石', 'デッキから1枚選んで引く');
    }

    const [draw] = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      stack.processing.owner.deck,
      '手札に加えるカードを選択してください'
    );
    Effect.move(stack, stack.processing, draw, 'hand');
  },
};
