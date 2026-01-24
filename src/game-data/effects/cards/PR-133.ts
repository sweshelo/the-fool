import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■洗礼の祈り
  // このユニットがオーバークロックした時、あなたの全てのユニットの行動権を回復する。
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, '洗礼の祈り', '味方全体の行動権を回復');

    // 自分の全てのユニットの行動権を回復
    for (const unit of owner.field) {
      Effect.activate(stack, stack.processing, unit, true);
    }
  },
};
