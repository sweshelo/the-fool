import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 対戦相手のターン終了時、対戦相手に1ライフダメージを与える
  checkTurnEnd: (stack: StackWithCard): boolean => {
    return stack.source.id === stack.processing.owner.opponent.id;
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '傾国の美女・貂蝉', '1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
  },
};
