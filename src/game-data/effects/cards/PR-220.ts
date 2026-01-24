import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const ownTargets = stack.processing.owner.field.filter(unit => unit.id !== stack.processing.id);
    const opponentTargets = EffectHelper.random(
      stack.processing.owner.opponent.field,
      ownTargets.length
    );
    if (ownTargets.length === 0) return;

    const message = [
      '自身以外の味方全体を破壊',
      opponentTargets.length >= 3
        ? '相手ユニットをランダムで破壊\n2ライフダメージ'
        : opponentTargets.length > 0
          ? '相手ユニットをランダムで破壊\n1ライフダメージ'
          : undefined,
    ];

    await System.show(stack, '滅セヨ、全テヲ', message.join('\n'));
    [...ownTargets, ...opponentTargets].forEach(unit =>
      Effect.break(stack, stack.processing, unit)
    );
  },
};
