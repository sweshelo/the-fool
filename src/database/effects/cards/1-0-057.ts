import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: async (stack: StackWithCard): Promise<boolean> => {
    return stack.source.id === stack.processing.owner.id;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'サプライズボックス', 'トリガーカードを2枚引く');
    const targets = stack.processing.owner.deck
      .filter(card => card.catalog.type === 'trigger')
      .slice(0, 2);

    targets.forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
  },
};
