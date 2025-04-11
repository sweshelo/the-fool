import { System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '効果名', '');
  },

  // 自身以外が召喚された時に発動する効果を記述
  // 味方ユニットであるかの判定などを忘れない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    // Now we can safely access stack.processing without a check
    // because StackWithCard guarantees it exists
    await System.show(stack, '効果名', '');
  },
};
