import { System } from '../../classes/system';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    // フィールドにユニットが存在するか確認
    return core.players.some(p => p.field.length > 0);
  },

  onJokerSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'ボルカニックディザスター', '全てのユニットに7000ダメージ');

    // 全てのユニットに7000ダメージを与える
    stack.core.players.forEach(player => {
      player.field.forEach(unit => {
        Effect.damage(stack, stack.processing, unit, 7000);
      });
    });
  },
};
