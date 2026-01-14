import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■砂塵の抱擁
  // このユニットが戦闘した時、戦闘中の相手ユニットの基本BPを-3000する。このユニットを破壊する。
  onBattleSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const target = stack.processing.id === stack.target?.id ? stack.source : stack.target;
    if (!(target instanceof Unit)) return;

    await System.show(stack, '砂塵の抱擁', '基本BP-3000\n自身を破壊する');

    // 相手ユニットの基本BPを-3000する
    Effect.modifyBP(stack, stack.processing, target, -3000, {
      isBaseBP: true,
    });

    // このユニット自身を破壊する
    Effect.break(stack, stack.processing, stack.processing, 'effect');
  },
};
