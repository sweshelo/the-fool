import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    // 対戦相手のフィールドにユニットがいる場合
    if (opponent.field.length > 0) {
      await System.show(stack, '破滅谷の神獣', '【加護】\nユニットを破壊');
      Effect.keyword(stack, stack.processing, stack.processing, '加護');

      // 対戦相手のBPが最も高いユニットからランダムで1体破壊する
      const max = Math.max(...opponent.field.map(unit => unit.currentBP));
      const candidate = opponent.field.filter(unit => unit.currentBP === max);
      EffectHelper.random(candidate).forEach(unit => Effect.break(stack, stack.processing, unit));
    }
  },
};
