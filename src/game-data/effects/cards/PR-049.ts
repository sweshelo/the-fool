import type { Card } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットがフィールドに出た時
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    const targets = opponent.field.filter(unit => unit.currentBP >= 9000);
    return stack.source.id === owner.id && targets.length > 0;
  },

  onDrive: async (stack: StackWithCard<Card>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    await System.show(stack, '弱者の回廊', 'BP9000以上のユニットを破壊');
    const targets = opponent.field.filter(unit => unit.currentBP >= 9000);
    targets.forEach(unit => {
      Effect.break(stack, stack.processing, unit);
    });
  },
};
