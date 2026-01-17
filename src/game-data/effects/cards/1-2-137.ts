import { System, EffectTemplate, Effect } from '..';
import type { StackWithCard } from '../schema/types';

export const effects = {
  checkTurnStart: (stack: StackWithCard) => {
    return (
      stack.processing.owner.id !== stack.core.getTurnPlayer().id &&
      stack.processing.owner.field.length === 1
    );
  },

  onTurnStart: async (stack: StackWithCard) => {
    await System.show(
      stack,
      '歴戦の勇士',
      'BP+5000\n【加護】と【沈黙効果耐性】を与える\nインターセプトカードを1枚引く'
    );
    const [target] = stack.processing.owner.field;

    if (target) {
      Effect.modifyBP(stack, stack.processing, target, 5000, { event: 'turnEnd', count: 1 });
      Effect.keyword(stack, stack.processing, target, '加護', { event: 'turnEnd', count: 1 });
      Effect.keyword(stack, stack.processing, target, '沈黙効果耐性', {
        event: 'turnEnd',
        count: 1,
      });
    }

    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
  },
};
