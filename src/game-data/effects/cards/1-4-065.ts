import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■ネクロポリス
  // あなたのユニットが効果によって破壊された時
  checkBreak: (stack: StackWithCard): boolean => {
    const trashUnits = stack.processing.owner.trash.filter(
      card => card instanceof Unit && card.catalog.type === 'unit' && card.catalog.cost <= 3
    );

    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      EffectHelper.isBreakByEffect(stack) &&
      stack.processing.owner.field.length <= 3 &&
      trashUnits.length > 0
    );
  },

  onBreak: async (stack: StackWithCard): Promise<void> => {
    const trashUnits = stack.processing.owner.trash.filter(
      card => card instanceof Unit && card.catalog.type === 'unit' && card.catalog.cost <= 3
    );

    await System.show(stack, 'ネクロポリス', 'コスト3以下をランダムで2体まで【特殊召喚】');

    const unitsToSummon = EffectHelper.random(trashUnits, 2);

    for (const unit of unitsToSummon) {
      if (unit instanceof Unit) {
        await Effect.summon(stack, stack.processing, unit);
      }
    }
  },
};
