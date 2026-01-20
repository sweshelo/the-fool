import { System, EffectTemplate, Effect } from '..';
import type { StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

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

  checkBattle: (stack: StackWithCard) => {
    //自身のフィールドのユニットが1体以下の場合に発動
    return stack.processing.owner.field.length <= 1;
  },

  onBattle: async (stack: StackWithCard) => {
    if (!(stack.source instanceof Unit) || !(stack.target instanceof Unit)) return;

    const ownUnit =
      stack.processing.owner.id === stack.source.owner.id ? stack.source : stack.target;

    await System.show(stack, '歴戦の戦士', 'BP+10000');

    Effect.modifyBP(stack, stack.processing, ownUnit, 10000, { event: 'turnEnd', count: 1 });
  },
};
