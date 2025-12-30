import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // インターセプト: 対戦相手のユニットがフィールドに出た時
  checkDrive: (stack: StackWithCard): boolean => {
    return (
      stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.opponent.id
    );
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const target = stack.target;
    if (!(target instanceof Unit)) return;

    // ドラゴンユニットの場合は破壊
    if (target.catalog.species?.includes('ドラゴン')) {
      await System.show(stack, 'ドラゴンスレイヤー', '【ドラゴン】を破壊');
      Effect.break(stack, stack.processing, target);
    } else {
      // それ以外は基本BP-2000
      await System.show(stack, 'ドラゴンスレイヤー', '基本BP-2000');
      Effect.modifyBP(stack, stack.processing, target, -2000, { isBaseBP: true });
    }
  },
};
