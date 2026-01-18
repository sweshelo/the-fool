import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  //このユニットがオーバークロックした時、対戦相手の全てのユニットに3000ダメージを与える。
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const targets = stack.processing.owner.opponent.field;
    if (targets.length === 0) return;
    await System.show(stack, 'ドッカーンッ！', '敵全体に3000ダメージ');
    for (const unit of targets) {
      Effect.damage(stack, stack.processing, unit, 3000);
    }
  },
};
