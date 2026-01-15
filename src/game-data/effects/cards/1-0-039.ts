import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const target = stack.processing.owner.opponent.field.filter(unit => unit.lv >= 2);
    if (target.length > 0) {
      await System.show(stack, '血塗られし報復', '敵全体のレベル2以上を破壊');
      target.forEach(unit => Effect.break(stack, stack.processing, unit, 'effect'));
    }
  },
};
