import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■私を怒らせるな
  // あなたのユニットがフィールドに出た時
  checkDrive: (stack: StackWithCard): boolean => {
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      (stack.processing.owner.purple ?? 0) >= 3
    );
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const myUnits = [...stack.processing.owner.field];

    if (myUnits.length > 0) {
      await System.show(
        stack,
        '私を怒らせるな',
        '味方全体を手札に戻す\n相手ユニットをランダムで手札に戻す\n紫ゲージ-3'
      );

      // 自分のユニットを全て手札に戻す
      myUnits.forEach(unit => {
        Effect.bounce(stack, stack.processing, unit, 'hand');
      });

      const bouncedCount = myUnits.length;

      // 相手のユニットからランダムで戻す
      const opponentUnits = stack.processing.owner.opponent.field;
      if (opponentUnits.length > 0) {
        const targetsToReturn = Math.min(bouncedCount, opponentUnits.length);
        const randomTargets = EffectHelper.random(opponentUnits, targetsToReturn);

        randomTargets.forEach(unit => {
          Effect.bounce(stack, stack.processing, unit, 'hand');
        });
      }

      // 紫ゲージを-3
      await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, -3);
    }
  },
};
