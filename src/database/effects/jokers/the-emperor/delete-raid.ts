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

    await System.show(stack, 'デリートレイド', 'ランダム2体破壊\n1ライフダメージ');

    // 対戦相手のユニットからランダムで2体まで破壊する
    const targetCount = Math.min(2, opponent.field.length);
    const targets = EffectHelper.random(opponent.field, targetCount);

    let destroyedCount = 0;
    targets.forEach(unit => {
      Effect.break(stack, stack.processing, unit);
      destroyedCount++;
    });

    // 破壊した場合、対戦相手に1ライフダメージを与える
    if (destroyedCount > 0) {
      Effect.modifyLife(stack, stack.processing, opponent, -1);
    }
  },
};
