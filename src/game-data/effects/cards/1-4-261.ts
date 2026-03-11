import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) =>
    stack.source.id === stack.processing.owner.id &&
    EffectHelper.isUnitSelectable(stack.core, 'owns', stack.processing.owner),
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, 'ペイン・シャドウ', 'ユニットを破壊する');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'owns',
      '破壊するユニットを選択'
    );
    Effect.break(stack, stack.processing, target);
  },
};
