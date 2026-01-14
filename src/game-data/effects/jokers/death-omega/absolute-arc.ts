import { Effect } from '../../engine/effect';
import { System } from '../../engine/system';
import type { CardEffects, StackWithCard } from '../../schema/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    // フィールドに5体以上のユニットがあり、手札が7枚以上あるか確認
    return player.field.length >= 5 && player.hand.length >= 7;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'アブソリュート・アーク', '対戦に勝利する');

    // 対戦に勝利する
    Effect.modifyLife(
      stack,
      stack.processing,
      stack.processing.owner.opponent,
      -stack.processing.owner.opponent.life.current
    );
  },
};
