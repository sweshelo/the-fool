import { System } from '../../classes/system';
import { Effect } from '../../classes/effect';
import { EffectHelper } from '../../classes/helper';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    const opponent = player.opponent;
    return opponent.field.length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    if (opponent.field.length === 0) return;

    await System.show(stack, 'ソウルエクスキューション', 'ランダム2体に【沈黙】');

    // 対戦相手のユニットからランダムで2体に【沈黙】を与える
    const targetCount = Math.min(2, opponent.field.length);
    const targets = EffectHelper.random(opponent.field, targetCount);

    targets.forEach(unit => {
      Effect.keyword(stack, stack.processing, unit, '沈黙');
    });
  },
};
