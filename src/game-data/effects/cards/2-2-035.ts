import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

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

    const discardTarget = await EffectHelper.selectCard(
      stack,
      owner,
      owner.hand,
      '捨てるカードを選択してください',
      2
    );

    const drawTarget = await EffectHelper.selectCard(
      stack,
      owner,
      owner.deck,
      '手札に加えるカードを選択してください',
      2
    );

    discardTarget.forEach(card => Effect.break(stack, stack.processing, card));
    drawTarget.forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
  },
};
