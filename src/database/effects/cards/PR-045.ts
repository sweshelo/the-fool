import type { Card } from '@/package/core/class/card';
import { Effect } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  // インターセプト: 対戦相手のターン開始時
  checkTurnStart: (stack: StackWithCard<Card>): boolean => {
    return stack.source.id === stack.processing.owner.opponent.id;
  },

  onTurnStart: async (stack: StackWithCard<Card>): Promise<void> => {
    await System.show(stack, 'アルカナジェネレーター', 'ジョーカーゲージ20%上昇');
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 20);
  },
};
