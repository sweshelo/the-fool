import { System } from '../../engine/system';
import { Effect } from '../../engine/effect';
import type { CardEffects, StackWithCard } from '../../schema/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    return player.field.length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    if (owner.field.length === 0) return;

    await System.show(stack, 'シャープリィスライヴ', 'オーバークロックさせる');

    // 自分の全てのユニットをオーバークロックさせる
    owner.field.forEach(unit => {
      Effect.clock(stack, stack.processing, unit, 1);
    });
  },
};
