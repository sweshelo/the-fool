import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■執念の爪痕
  // このユニットが破壊された時、対戦相手のユニットを１体選ぶ。
  // それにデスカウンター［１］を与える。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 対戦相手にユニットが選択可能か確認
    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) return;

    await System.show(
      stack,
      '執念の爪痕',
      '対戦相手のユニットを1体選ぶ\nそれにデスカウンター[1]を与える'
    );

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      'デスカウンターを与えるユニットを選択してください'
    );

    if (target) {
      // デスカウンター[1]を与える
      Effect.death(stack, stack.processing, target, 1);
    }
  },
};
