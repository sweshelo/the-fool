import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) {
      await System.show(stack, 'ジャンプーダンス', '手札に戻す');
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        'opponents',
        '手札に戻すユニットを選択'
      );
      if (!target) return;
      Effect.bounce(stack, stack.processing, target, 'hand');
    }
  },
};
