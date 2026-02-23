import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

const effect = async (stack: StackWithCard<Unit>) => {
  const isOwnUnitSelectable = EffectHelper.isUnitSelectable(
    stack.core,
    'owns',
    stack.processing.owner
  );
  const isOpponentUnitSelectable = EffectHelper.isUnitSelectable(
    stack.core,
    'opponents',
    stack.processing.owner
  );

  if (isOwnUnitSelectable || isOpponentUnitSelectable) {
    let myTarget: Unit | undefined;
    let opponentTarget: Unit | undefined;

    await System.show(stack, 'バニシング・ポイント', 'お互いのユニットを消滅');

    if (isOwnUnitSelectable) {
      [myTarget] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'owns',
        '消滅させる自分のユニットを選択'
      );
    }

    if (isOpponentUnitSelectable) {
      [opponentTarget] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        '消滅させる相手のユニットを選択'
      );
    }

    if (myTarget) Effect.delete(stack, stack.processing, myTarget);
    if (opponentTarget) Effect.delete(stack, stack.processing, opponentTarget);
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
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(stack, 'エリミネイト・ポイント', 'ユニットを消滅');

      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        '消滅させる相手のユニットを選択'
      );

      Effect.delete(stack, stack.processing, target);
    }
  },
};
