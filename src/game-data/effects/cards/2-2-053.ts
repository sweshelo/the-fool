import type { Card } from '@/package/core/class/card';
import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットがアタックした時
  checkAttack: (stack: StackWithCard<Card>): boolean => {
    const owner = stack.processing.owner;
    const targets = owner.field.filter(unit => unit.bp < unit.currentBP);
    return stack.target instanceof Unit && stack.target.owner.id === owner.id && targets.length > 0;
  },

  onAttack: async (stack: StackWithCard<Card>): Promise<void> => {
    if (!(stack.target instanceof Unit)) return;

    const owner = stack.processing.owner;
    const targets = owner.field.filter(unit => unit.bp < unit.currentBP);

    await System.show(stack, '進化の奇跡', '一時的にBPが上昇しているユニットに貫通を付与');
    targets.forEach(unit => {
      Effect.keyword(stack, stack.processing, unit, '貫通', {
        event: 'turnEnd',
        count: 1,
      });
    });
  },
};
