import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';
import { EffectHelper } from '../classes/helper';

export const effects: CardEffects = {
  onBreakSelf: async (stack: StackWithCard<Unit>) => {
    if (
      stack.option?.type === 'break' &&
      stack.option.cause === 'battle' &&
      EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)
    ) {
      await System.show(stack, '三柱のアネモイ', '行動権を消費');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        '行動権を消費するユニットを選択してください'
      );
      Effect.activate(stack, stack.processing, target, false);
    }
  },
};
