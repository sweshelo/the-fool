// ■ドクターラボ\nあなたの【機械】ユニットがフィールドに出た時、それの基本BPを+1000し、【加護】を与える。
import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたの【機械】ユニットがフィールドに出た時
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === owner.id &&
      !!stack.target.catalog.species?.includes('機械') &&
      owner.field.some(unit => unit.id === stack.target?.id)
    );
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.target instanceof Unit)) return;
    await System.show(stack, 'ドクターラボ', '基本BP+1000\n【加護】を付与');

    // それの基本BPを+1000し、【加護】を与える
    Effect.modifyBP(stack, stack.processing, stack.target, 1000, { isBaseBP: true });
    Effect.keyword(stack, stack.processing, stack.target, '加護');
  },
};
