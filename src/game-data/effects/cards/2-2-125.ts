import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const targets = stack.processing.owner.opponent.field.filter(unit => unit.lv >= 2);
    if ((stack.processing.owner.purple ?? 0) < 3 || targets.length === 0) return;

    await System.show(stack, 'カオティックロジカレーザー', '敵全体のレベル2以上を破壊');
    targets.forEach(unit => Effect.break(stack, stack.processing, unit, 'effect'));
  },
  onDrive: async (stack: StackWithCard) => {
    if (
      !(stack.target instanceof Unit) ||
      stack.target.owner.id === stack.processing.owner.id ||
      stack.target.lv !== 1
    )
      return;
    await System.show(stack, '狂宴のトリック', 'レベル+1');
    Effect.clock(stack, stack.processing, stack.target, 1);
  },
};
