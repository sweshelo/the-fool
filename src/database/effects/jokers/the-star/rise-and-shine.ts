import { System } from '../../classes/system';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    // フィールドにユニットが存在するか確認
    return core.players.some(p => p.field.length > 0);
  },

  onJokerSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'ライズアンドシャイン', '全てのユニットを消滅させる');

    // 全てのユニットを消滅させる
    stack.core.players.forEach(player => {
      [...player.field].forEach(unit => {
        Effect.delete(stack, stack.processing, unit);
      });
    });
  },
};
