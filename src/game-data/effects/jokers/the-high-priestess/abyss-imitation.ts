import { System } from '../../engine/system';
import { Effect } from '../../engine/effect';
import type { CardEffects, StackWithCard } from '../../schema/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    const opponent = player.opponent;
    return opponent.field.length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    if (opponent.field.length === 0) return;

    await System.show(
      stack,
      'アビスイミテーション',
      '【進化禁止】【撤退禁止】\nデスカウンター[1]を付与'
    );

    // 対戦相手の全てのユニットに【進化禁止】と【撤退禁止】とデスカウンター[1]を与える
    opponent.field.forEach(unit => {
      Effect.keyword(stack, stack.processing, unit, '進化禁止');
      Effect.keyword(stack, stack.processing, unit, '撤退禁止');
      Effect.death(stack, stack.processing, unit, 1);
    });
  },
};
