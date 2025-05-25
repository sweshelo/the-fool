import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  checkTurnStart: (stack: StackWithCard) => {
    return stack.processing.owner.id !== stack.core.getTurnPlayer().id;
  },

  onTurnStart: async (stack: StackWithCard) => {
    const intercepts =
      stack.processing.owner.hand.length < stack.core.room.rule.player.max.hand
        ? stack.processing.owner.deck.filter(card => card.catalog.type === 'intercept')
        : [];
    await System.show(
      stack,
      '佳人の午後',
      `コスト7以上をフィールドに出せない${intercepts.length > 0 ? '\nインターセプトカードを選んで引く' : ''}`
    );
    stack.processing.owner.opponent.hand
      .filter(card => card.catalog.cost >= 7)
      .forEach(card => card.delta.push(new Delta({ type: 'banned' }, { event: 'turnEnd' })));

    if (intercepts.length > 0) {
      const [target] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        intercepts,
        '手札に加えるかカードを選択して下さい',
        1
      );
      Effect.move(stack, stack.processing, target, 'hand');
    }
  },
};
