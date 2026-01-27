import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■ナガマダヂ、オデ、マモル
  // あなたのユニットが破壊されるたび、ユニットを１体選ぶ。
  // ターン終了時までそれのＢＰを＋３０００する。

  onBreak: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.target instanceof Unit) || stack.target.owner.id !== stack.processing.owner.id)
      return;

    const targetId = stack.target.id;
    const filter = (unit: Unit) => unit.id !== targetId;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, 'ナガマダヂ、オデ、マモル', 'BP+3000');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        'BP+3000するユニットを選択'
      );
      Effect.modifyBP(stack, stack.processing, target, 3000, { event: 'turnEnd', count: 1 });
    }
  },
};
