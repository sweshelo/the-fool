import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットが戦闘によって破壊された時、戦闘中の相手ユニットを破壊する。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (!(stack.source instanceof Unit)) return;
    if (!(stack.target instanceof Unit)) return;

    // 戦闘による破壊か
    if (stack.option?.type !== 'break') return;
    if (stack.option.cause === 'battle') {
      await System.show(stack, '石化の瞳', '戦闘中の相手ユニットを破壊');
      Effect.break(stack, stack.processing, stack.source);
    }
  },
};
