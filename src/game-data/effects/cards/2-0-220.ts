import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    if (
      (stack.processing.owner.purple ?? 0) < 4 ||
      stack.processing.owner.field.length + stack.processing.owner.opponent.field.length === 1
    )
      return;
    await System.show(stack, 'せんじん再臨', '自身以外のユニットを破壊\n紫ゲージ-4');
    EffectHelper.exceptSelf(stack.core, stack.processing, unit =>
      Effect.break(stack, stack.processing, unit)
    );
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, -4);
  },
};
