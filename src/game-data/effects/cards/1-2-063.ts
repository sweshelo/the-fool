import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkPlayerAttack(stack: StackWithCard) {
    return (
      stack.processing.owner.life.current <= 1 &&
      stack.source instanceof Unit &&
      stack.processing.owner.id !== stack.source.owner.id &&
      [...stack.processing.owner.field, ...stack.processing.owner.opponent.field].length > 0
    );
  },

  checkTurnStart(stack: StackWithCard) {
    return (
      stack.processing.owner.life.current <= 1 &&
      stack.source.id === stack.processing.owner.id &&
      [...stack.processing.owner.field, ...stack.processing.owner.opponent.field].length > 0
    );
  },

  async onPlayerAttack(stack: StackWithCard) {
    await System.show(stack, '世界創生', '全ユニットを消滅');
    [...stack.processing.owner.field, ...stack.processing.owner.opponent.field].forEach(unit =>
      Effect.delete(stack, stack.processing, unit)
    );
  },

  async onTurnStart(stack: StackWithCard) {
    await System.show(stack, '世界創生', '全ユニットを消滅');
    [...stack.processing.owner.field, ...stack.processing.owner.opponent.field].forEach(unit =>
      Effect.delete(stack, stack.processing, unit)
    );
  },
};
