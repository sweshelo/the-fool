import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.id && unit.catalog.color === Color.YELLOW,
      stack.processing.owner
    );
    if (stack.processing.owner.id === stack.source.id) {
      await System.show(stack, 'イエロー・クロック', '黄属性ユニットのレベル+1');
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidates,
        'レベルを+1するユニットを選択して下さい'
      );
      Effect.clock(stack, stack.processing, target, 1);
    }
  },
};
