import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkDrive: stack =>
    stack.source.id === stack.processing.owner.id &&
    stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('侍')).length >= 2,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '運命共同体', '【侍】の基本BP+[【侍】×1000]');
    const targets = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('侍')
    );
    targets.forEach(unit =>
      Effect.modifyBP(stack, stack.processing, unit, targets.length * 1000, { isBaseBP: true })
    );
  },
};
