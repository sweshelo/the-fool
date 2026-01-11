import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ターン開始時: ターンプレイヤーを問わない
  checkTurnStart: stack => stack.processing.owner.field.length > 0,
  onTurnStart: async (stack: StackWithCard) => {
    await System.show(stack, '聖なる領域', '味方全体に【加護】を付与');
    stack.processing.owner.field.forEach(unit =>
      Effect.keyword(stack, stack.processing, unit, '加護')
    );
  },
};
