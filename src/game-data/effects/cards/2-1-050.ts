import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 対戦相手のユニットがフィールドに出た時、
  // それの基本BPを-［フィールドに出たユニットのコスト×1500］する
  checkDrive: (stack: StackWithCard) => {
    return stack.target instanceof Unit && stack.target.owner.id !== stack.processing.owner.id;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.target instanceof Unit)) return;

    const cost = stack.target.catalog.cost;
    const bpReduction = cost * 1500;

    await System.show(stack, 'アイヴィーバインド', `基本BP-${bpReduction}`);
    Effect.modifyBP(stack, stack.processing, stack.target, -bpReduction, { isBaseBP: true });
  },
};
