import { System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: async (stack: StackWithCard): Promise<boolean> => {
    // Example usage of stack to prevent unused variable warning
    console.log(`Checking drive effect for card: ${stack.processing.catalogId}`);
    return true;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '効果名', '');
  },
};
