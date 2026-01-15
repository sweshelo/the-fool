import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、あなたのライフが4以上だった場合、このユニットを破壊する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // プレイヤーのライフが4以上か確認
    if (stack.processing.owner.life.current >= 4) {
      await System.show(stack, '生贄の祭壇', '自身を破壊');
      Effect.break(stack, stack.processing, stack.processing, 'effect');
    }
  },
};
