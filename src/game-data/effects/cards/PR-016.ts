import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットがフィールドでクロックアップするたび、そのユニットの基本BPを+2000する。
  onClockup: async (stack: StackWithCard<Unit>): Promise<void> => {
    // stack.targetが存在し、Unitのインスタンスであることを確認
    if (
      stack.target &&
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id
    ) {
      await System.show(stack, 'グロウダンス', 'BP+2000');
      Effect.modifyBP(stack, stack.processing, stack.target, +2000, { isBaseBP: true });
    }
  },
};
