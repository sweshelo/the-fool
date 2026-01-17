import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkDrive: stack =>
    stack.processing.owner.field.length >= 3 && stack.processing.owner.id === stack.source.id,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, 'センターポジション', '味方全体の基本BP+1000');
    stack.processing.owner.field.forEach(unit =>
      Effect.modifyBP(stack, stack.processing, unit, 1000, { isBaseBP: true })
    );
  },
};
