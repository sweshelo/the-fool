import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;
    const unitsToDestroy = stack.processing.owner.opponent.field.filter(
      unit => unit.currentBP > unit.bp
    );

    if (owner.hand.length === 0 || unitsToDestroy.length === 0) return;

    const choice = await EffectHelper.choice(stack, owner, '選略・校則違反よ！', [
      { id: '1', description: '効果なし' },
      { id: '2', description: '手札を2枚捨てる\nユニットを破壊' },
    ]);

    if (choice === '2') {
      await System.show(stack, '選略・校則違反よ！', '手札を2枚捨てる\nユニットを破壊');

      // ランダムで2枚捨てる
      EffectHelper.random(owner.hand, 2).forEach(card => Effect.break(stack, self, card));

      // BPが一時的に上昇している対戦相手のユニットを破壊
      unitsToDestroy.forEach(unit => Effect.break(stack, self, unit, 'effect'));
    }
  },
};
