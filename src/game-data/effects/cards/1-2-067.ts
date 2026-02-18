import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkPlayerAttack: stack =>
    stack.target?.id === stack.processing.owner.id &&
    stack.processing.owner.field.length <= 0 &&
    EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner),
  onPlayerAttack: async (stack: StackWithCard) => {
    await System.show(stack, '軍師の采配', 'ユニットを破壊');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      '破壊するユニットを選択して下さい'
    );
    Effect.break(stack, stack.processing, target);
  },
};
