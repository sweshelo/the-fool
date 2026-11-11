import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onOverclockSelf: async (stack: StackWithCard<Unit>) => {
    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) return;
    await System.show(stack, 'ウェイト', '行動権を消費');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      '行動権を消費するユニットを選択して下さい'
    );
    Effect.activate(stack, stack.processing, target, false);
  },
};
