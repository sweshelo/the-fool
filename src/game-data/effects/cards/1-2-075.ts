import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkPlayerAttack: stack =>
    stack.processing.owner.field.length <= 0 && stack.target?.id === stack.processing.owner.id,
  onPlayerAttack: async (stack: StackWithCard) => {
    await System.show(stack, 'リベリオンの盾', '1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
  },
};
