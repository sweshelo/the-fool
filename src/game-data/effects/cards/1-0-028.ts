import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  //このユニットが破壊された時
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // あなたの捨札にあるユニットカードを1枚ランダムで手札に加える
    const owner = stack.processing.owner;
    const trashUnits = owner.trash.filter(card => card instanceof Unit);
    const [reviveCard] = EffectHelper.random(trashUnits, 1);
    if (reviveCard) {
      await System.show(stack, 'リバイブ', 'ユニットカードを回収');
      Effect.move(stack, stack.processing, reviveCard, 'hand');
    }
  },
};
