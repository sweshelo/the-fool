import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkTurnStart: stack =>
    stack.processing.owner.field.length <= 0 &&
    stack.source.id !== stack.processing.owner.id &&
    EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner),
  onTurnStart: async (stack: StackWithCard) => {
    await System.show(stack, 'ツインロック', '行動権を消費');
    (
      await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        '行動権を消費するユニットを選択してください',
        2
      )
    ).forEach(unit => Effect.activate(stack, stack.processing, unit, false));
  },
};
