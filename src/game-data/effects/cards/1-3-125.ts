import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) =>
    stack.processing.owner.field.length + stack.processing.owner.opponent.field.length > 0,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '皆既日食', '全ユニットの行動権を回復');
    [...stack.processing.owner.field, ...stack.processing.owner.opponent.field].forEach(unit =>
      Effect.activate(stack, stack.processing, unit, true)
    );
  },
};
