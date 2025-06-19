import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    return stack.processing.owner.id === stack.source.id;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '進化の系譜', '進化ユニットを1枚引く\nレベル+1');
    const target = stack.processing.owner.deck.find(card => card.catalog.type === 'advanced_unit');
    if (target) {
      Effect.move(stack, stack.processing, target, 'hand');
      target.lv++;
    }
  },
};
