import { System } from '../../classes/system';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (_player, _core) => {
    return true;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    await System.show(stack, 'リトルウォンド', 'CP+8');

    // CPを+8する
    Effect.modifyCP(stack, stack.processing, owner, 8);
  },
};
