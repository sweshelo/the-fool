import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkTurnStart: stack =>
    stack.processing.owner.id !== stack.source.id &&
    stack.processing.owner.field.length <= 0 &&
    EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner),
  onTurnStart: async (stack: StackWithCard) => {
    await System.show(stack, '停戦協定', '手札に戻す');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      '手札に戻すユニットを選択して下さい'
    );
    Effect.bounce(stack, stack.processing, target, 'hand');
  },
};
