import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■不可侵光壁
  // あなたのユニットが戦闘した時
  checkBattle: (stack: StackWithCard): boolean => {
    return (
      stack.source instanceof Unit &&
      stack.source.owner.id === stack.processing.owner.id &&
      stack.target instanceof Unit
    );
  },

  onBattle: async (stack: StackWithCard): Promise<void> => {
    const attacker = stack.source;
    const defender = stack.target;

    if (attacker instanceof Unit && defender instanceof Unit) {
      const defenderBP = defender.currentBP;
      await System.show(stack, '不可侵光壁', `BP+[戦闘中の敵ユニットのBP]`);

      Effect.modifyBP(stack, stack.processing, attacker, defenderBP, {
        event: 'turnEnd',
        count: 1,
      });
    }
  },
};
