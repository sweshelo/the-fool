import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

const effect = async (stack: StackWithCard<Unit>) => {
  const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.id;
  const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.opponent.id;
  if (myCandidates_selectable && opponentCandidates_selectable) {
    await System.show(stack, 'バニシング・ポイント', 'お互いのユニットを消滅');

    const [myTarget] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      '消滅させる自分のユニットを選択'
    );

    const [opponentTarget] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
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
    const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.opponent.id;
    if (EffectHelper.isSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, 'エリミネイト・ポイント', '敵ユニットを消滅');

      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '消滅させる相手のユニットを選択'
      );

      Effect.delete(stack, stack.processing, target);
    }
  },
};
