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
      await System.show(stack, '灼熱の伝染', '4000ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'ダメージを与えるユニットを選択して下さい'
      );
      Effect.damage(stack, stack.processing, target, 4000);
    }
  },
};
