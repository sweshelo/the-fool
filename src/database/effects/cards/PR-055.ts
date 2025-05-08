import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.opponent.field.length > 0) {
      await System.show(stack, '静寂を生む闇', '敵全体に【沈黙】を与える');
      stack.processing.owner.opponent.field.forEach(unit =>
        Effect.keyword(stack, stack.processing, unit, '沈黙')
      );
    }
  },

  onBreakSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'インターセプトドロー', 'インターセプトカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
  },
};
