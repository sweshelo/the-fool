import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身のユニットがフィールドに出た時: 対戦相手ユニットが存在するかチェック
  checkDrive: (stack: StackWithCard): boolean => {
    return (
      stack.target instanceof Unit &&
      stack.processing.owner.id === stack.target.owner.id &&
      stack.processing.owner.opponent.field.length > 0
    );
  },

  // 紫ゲージに応じてダメージ回数を変更
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const purple = stack.processing.owner.purple ?? 0;
    const repeatCount = purple <= 2 ? 3 : 7;
    const message = purple <= 2 ? '1000ダメージ×3' : '1000ダメージ×7';

    await System.show(stack, 'ホーミングバレット', message);

    const targets = stack.processing.owner.opponent.field;

    EffectHelper.repeat(repeatCount, () => {
      const [target] = EffectHelper.random(targets);
      if (target) {
        Effect.damage(stack, stack.processing, target, 1000, 'effect');
      }
    });
  },
};
