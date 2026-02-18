import { System } from '../../engine/system';
import { Effect } from '../../engine/effect';
import type { CardEffects, StackWithCard } from '../../schema/types';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    // フィールドにユニットが存在するか確認
    return core.players.some(p => p.field.length > 0);
  },

  onJokerSelf: async (stack: StackWithCard) => {
    await System.show(stack, '奥義・タワーエグゼクト', '全てのユニットを手札に戻す');

    // 全てのユニットを手札に戻す
    stack.core.players.forEach(player => {
      [...player.field].forEach(unit => {
        Effect.bounce(stack, stack.processing, unit, 'hand');
      });
    });
  },
};
