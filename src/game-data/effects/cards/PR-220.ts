import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { EffectHelper } from '../engine/helper';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const ownTargets = stack.processing.owner.field.filter(unit => unit.id !== stack.processing.id);
    const opponentTargets = EffectHelper.random(
      stack.processing.owner.opponent.field,
      ownTargets.length
    );

    await EffectHelper.combine(stack, [
      {
        title: '滅セヨ、全テヲ',
        description: '自身以外の味方全体を破壊',
        effect: () => ownTargets.forEach(unit => Effect.break(stack, stack.processing, unit)),
        condition: () => ownTargets.length > 0,
      },
      {
        title: '滅セヨ、全テヲ',
        description: '相手ユニットをランダムで破壊',
        effect: () => opponentTargets.forEach(unit => Effect.break(stack, stack.processing, unit)),
        condition: () => opponentTargets.length > 0,
      },
      {
        title: '滅セヨ、全テヲ',
        description: '1ライフダメージ',
        effect: () => Effect.modifyLife(stack, stack.processing, stack.processing.owner, -1),
        condition: () => opponentTargets.length < 3 && opponentTargets.length > 0,
      },
      {
        title: '滅セヨ、全テヲ',
        description: '2ライフダメージ',
        effect: () => Effect.modifyLife(stack, stack.processing, stack.processing.owner, -2),
        condition: () => opponentTargets.length >= 3,
      },
    ]);
  },

  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    const purple = stack.processing.owner.purple ?? 0;
    if (purple > 0) {
      await System.show(
        stack,
        '滅セヨ、全テヲ',
        '全てのユニットの基本BPを[紫ゲージの数×1000]にする'
      );
      [stack.processing.owner, stack.processing.owner.opponent]
        .flatMap(player => player.field)
        .forEach(unit => {
          Effect.modifyBP(stack, stack.processing, unit, purple * 1000 - unit.bp, {
            isBaseBP: true,
          });
        });
    }
  },

  onBreakSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '滅セヨ、全テヲ', '[タイニードラコ]を2枚作成');
    EffectHelper.repeat(2, () => Effect.make(stack, stack.processing.owner, '2-0-027'));
  },
};
