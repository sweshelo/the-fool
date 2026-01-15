import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、あなたのユニットを1体選ぶ。それの行動権を回復する。対戦相手のユニットを1体選ぶ。それの行動権を消費する。
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const isOwnsSelectable = EffectHelper.isUnitSelectable(stack.core, 'owns', owner);
    const isOpponentsSelectable = EffectHelper.isUnitSelectable(stack.core, 'opponents', owner);

    if (isOwnsSelectable || isOpponentsSelectable) {
      await System.show(stack, '流離の演奏', '行動権を回復');

      const [selfTarget] = isOwnsSelectable
        ? await EffectHelper.pickUnit(
            stack,
            owner,
            'owns',
            '行動権を回復するユニットを選んでください',
            1
          )
        : [];

      const [opponentTarget] = isOpponentsSelectable
        ? await EffectHelper.pickUnit(
            stack,
            owner,
            'opponents',
            '行動権を消費するユニットを選んでください',
            1
          )
        : [];

      // 選択したユニットの行動権を変更
      if (selfTarget) Effect.activate(stack, stack.processing, selfTarget, true);
      if (opponentTarget) Effect.activate(stack, stack.processing, opponentTarget, false);
    }
  },
};
