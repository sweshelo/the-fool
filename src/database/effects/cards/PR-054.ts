import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

const effect = async (stack: StackWithCard<Unit>) => {
  const myCandidates = EffectHelper.candidate(
    stack.core,
    unit => unit.owner.id === stack.processing.owner.id,
    stack.processing.owner
  );

  const opponentCandidates = EffectHelper.candidate(
    stack.core,
    unit => unit.owner.id === stack.processing.owner.opponent.id,
    stack.processing.owner
  );

  if (myCandidates.length > 0 && opponentCandidates.length > 0) {
    await System.show(stack, 'バニシング・ポイント', 'お互いのユニットを消滅');

    const [myTarget] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      myCandidates,
      '消滅させる自分のユニットを選択'
    );

    const [opponentTarget] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      opponentCandidates,
      '消滅させる相手のユニットを選択'
    );

    Effect.delete(stack, stack.processing, myTarget);
    Effect.delete(stack, stack.processing, opponentTarget);
  }
};

export const effects: CardEffects = {
  // ■バニシング・ポイント
  // あなたのユニットがフィールドに出た時
  onDriveSelf: effect,
  onDrive: async (stack: StackWithCard<Unit>) => {
    if (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.target.id !== stack.processing.id
    )
      await effect(stack);
  },
  // ■エリミネイト・ポイント
  // このユニットが消滅した時
  onDeleteSelf: async (stack: StackWithCard): Promise<void> => {
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );

    if (candidates.length > 0) {
      await System.show(stack, 'エリミネイト・ポイント', '敵ユニットを消滅');

      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidates,
        '消滅させる相手のユニットを選択'
      );

      Effect.delete(stack, stack.processing, target);
    }
  },
};
