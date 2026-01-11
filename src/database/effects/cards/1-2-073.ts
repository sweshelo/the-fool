import { Effect } from '../classes/effect';
import { EffectHelper } from '../classes/helper';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkTurnStart: stack =>
    stack.processing.owner.id === stack.source.id &&
    stack.processing.owner.trigger.some(card => card.id !== stack.processing.id),
  onTurnStart: async (stack: StackWithCard) => {
    await System.show(stack, '換金所', 'トリガーゾーンのカードを1枚破壊\nCP+2');
    const [target] = EffectHelper.random(stack.processing.owner.trigger);
    if (target) Effect.move(stack, stack.processing, target, 'trash');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 2);
  },
};
