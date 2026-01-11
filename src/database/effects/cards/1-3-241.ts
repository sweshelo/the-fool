import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: stack => {
    return stack.processing.owner.id === stack.source.id;
  },

  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '時の圧縮', 'ジョーカーゲージ+20%');
    Effect.modifyJokerGauge(stack, stack.processing, stack.processing.owner, 20);
    Effect.modifyJokerGauge(stack, stack.processing, stack.processing.owner.opponent, 20);
  },
};
