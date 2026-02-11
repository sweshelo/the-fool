import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDrive: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 相手のユニットが出た時のみ処理
    if (!(stack.target instanceof Unit && stack.target.owner.id === opponent.id)) return;

    if (
      EffectHelper.isUnitSelectable(stack.core, 'owns', stack.processing.owner) &&
      EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)
    ) {
      await System.show(
        stack,
        '代償の篝火',
        '自分のユニットに1000ダメージ\n相手のユニットに1000ダメージ'
      );
      const [ownTarget] = await EffectHelper.pickUnit(
        stack,
        owner,
        'owns',
        '1000ダメージを与えるユニットを選択'
      );

      const [opponentTarget] = await EffectHelper.pickUnit(
        stack,
        owner,
        'opponents',
        '1000ダメージを与えるユニットを選択'
      );

      // 選択したユニットに1000ダメージ
      Effect.damage(stack, stack.processing, ownTarget, 1000);
      Effect.damage(stack, stack.processing, opponentTarget, 1000);
    }
  },
};
