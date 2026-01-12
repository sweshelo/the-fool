import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ターン開始時、このユニット以外のあなたのユニットに1000ダメージを与える
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    const targets = stack.processing.owner.field.filter(unit => unit.id !== stack.processing.id);

    if (targets.length > 0) {
      await System.show(stack, '＜ウィルス・炎＞', '1000ダメージ');
      targets.forEach(unit => Effect.damage(stack, stack.processing, unit, 1000, 'effect'));
    }
  },
};
