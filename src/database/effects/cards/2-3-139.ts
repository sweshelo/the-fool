import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkBreak: (stack: StackWithCard) => {
    const brokenUnit = stack.processing.owner.field.find(unit => unit.id === stack.target?.id);
    return !!brokenUnit;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onBreak: async (stack: StackWithCard): Promise<void> => {
    switch (stack.processing.lv) {
      case 1:
      case 2: {
        await System.show(stack, '戦場の業火', 'お互いに1ライフダメージ');
        Effect.modifyLife(stack, stack.processing, stack.processing.owner, -1);
        Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
        break;
      }
      case 3: {
        await System.show(stack, '戦場の業火', '1ライフダメージ');
        Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
        break;
      }
    }
  },
};
