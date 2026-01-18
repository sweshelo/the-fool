import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■不可侵光壁
  // あなたのユニットが戦闘した時
  checkBattle: (_stack: StackWithCard) => {
    return true;
  },

  onBattle: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.source instanceof Unit) || !(stack.target instanceof Unit)) return;

    const ownUnit =
      stack.processing.owner.id === stack.source.owner.id ? stack.source : stack.target;
    const opponentUnit =
      stack.processing.owner.id === stack.source.owner.id ? stack.target : stack.source;

    const opponentBP = opponentUnit.currentBP;
    await System.show(stack, '不可侵光壁', `BP+[戦闘中の敵ユニットのBP]`);

    Effect.modifyBP(stack, stack.processing, ownUnit, opponentBP, {
      event: 'turnEnd',
      count: 1,
    });
  },
};
