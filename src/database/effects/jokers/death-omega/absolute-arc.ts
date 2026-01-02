import { Effect } from '../../classes/effect';
import { System } from '../../classes/system';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    // フィールドに5体以上のユニットがあり、手札が7枚以上あるか確認
    return player.field.length >= 5 && player.hand.length >= 7;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    await System.show(stack, 'アブソリュート・アーク', '勝利');

    // 対戦に勝利する
    Effect.modifyLife(
      stack,
      stack.processing,
      stack.processing.owner.opponent,
      -stack.processing.owner.opponent.life.current
    );
  },
};
