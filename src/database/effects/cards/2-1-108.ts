import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, '王頂よりの威光', 'トリガーゾーンにあるカードを使用できない');
  },

  fieldEffect: (stack: StackWithCard) => {
    stack.processing.owner.opponent.trigger
      .filter(
        card =>
          (card.catalog.type === 'trigger' || card.catalog.type === 'intercept') &&
          !card.delta.find(delta => delta.source?.unit === stack.processing.id)
      )
      .forEach(card =>
        card.delta.push(
          new Delta(
            { type: 'banned' },
            {
              source: { unit: stack.processing.id },
            }
          )
        )
      );
  },

  onBlockSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'ブロッカー', 'BP+2000');
    Effect.modifyBP(stack, stack.processing, stack.processing, 2000, {
      event: 'turnEnd',
      count: 1,
    });
  },
};
