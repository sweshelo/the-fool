import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、あなたのユニットを1体選ぶ。それの行動権を回復する。対戦相手のユニットを1体選ぶ。それの行動権を消費する。
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 自分のユニットを選択
    const selfCandidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === owner.id,
      owner
    );

    // 相手のユニットを選択
    const opponentCandidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === opponent.id,
      opponent
    );

    if (selfCandidates.length === 0 && opponentCandidates.length === 0) return;

    await System.show(stack, '流離の演奏', '行動権を回復');
    const [selfTarget] =
      selfCandidates.length > 0
        ? await EffectHelper.selectUnit(
            stack,
            owner,
            selfCandidates,
            '行動権を回復するユニットを選んでください',
            1
          )
        : [];

    const [opponentTarget] =
      opponentCandidates.length > 0
        ? await EffectHelper.selectUnit(
            stack,
            owner,
            opponentCandidates,
            '行動権を消費するユニットを選んでください',
            1
          )
        : [];

    // 選択したユニットの行動権を変更
    if (selfTarget) Effect.activate(stack, stack.processing, selfTarget, true);
    if (opponentTarget) Effect.activate(stack, stack.processing, opponentTarget, false);
  },
};
