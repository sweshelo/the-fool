import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、あなたのユニットを1体選ぶ。それの行動権を回復する。対戦相手のユニットを1体選ぶ。それの行動権を消費する。
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 自分のユニットを選択
    const selfCandidatesFilter = (unit: Unit) => unit.owner.id === owner.id;
    const selfCandidates_selectable = EffectHelper.isUnitSelectable(
      stack.core,
      selfCandidatesFilter,
      owner
    );

    // 相手のユニットを選択
    const opponentCandidatesFilter = (unit: Unit) => unit.owner.id === opponent.id;
    const opponentCandidates_selectable = EffectHelper.isUnitSelectable(
      stack.core,
      opponentCandidatesFilter,
      opponent
    );

    if (selfCandidates.length === 0 && opponentCandidates.length === 0) return;

    await System.show(stack, '流離の演奏', '行動権を回復');
    const [selfTarget] = selfCandidates_selectable
      ? await EffectHelper.pickUnit(
          stack,
          owner,
          selfCandidatesFilter,
          '行動権を回復するユニットを選んでください',
          1
        )
      : [];

    const [opponentTarget] = opponentCandidates_selectable
      ? await EffectHelper.pickUnit(
          stack,
          owner,
          opponentCandidatesFilter,
          '行動権を消費するユニットを選んでください',
          1
        )
      : [];

    // 選択したユニットの行動権を変更
    if (selfTarget) Effect.activate(stack, stack.processing, selfTarget, true);
    if (opponentTarget) Effect.activate(stack, stack.processing, opponentTarget, false);
  },
};
