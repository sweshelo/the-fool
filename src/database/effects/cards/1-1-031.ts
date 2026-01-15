import type { Card } from '@/package/core/class/card';
import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // あなたのユニットがフィールドに出た時、あなたのユニットと対戦相手のユニットをそれぞれ1体ずつ選ぶ。
  // それらに5000ダメージを与える。
  checkDrive: (stack: StackWithCard<Card>): boolean => {
    // あなたのユニットがフィールドに出た時
    const isOwnUnit =
      stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id;

    // 自分と相手にユニットが存在するか確認
    const hasOwnUnits = EffectHelper.isUnitSelectable(stack.core, 'owns', stack.processing.owner);
    const hasOpponentUnits = EffectHelper.isUnitSelectable(
      stack.core,
      'opponents',
      stack.processing.owner
    );

    return isOwnUnit && hasOwnUnits && hasOpponentUnits;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, 'ブロウ・アップ', '味方に5000ダメージ\n敵に5000ダメージ');

    // 自分のユニットを選択
    const [ownTarget] = await EffectHelper.pickUnit(
      stack,
      owner,
      'owns',
      '5000ダメージを与える自分のユニットを選択'
    );

    // 対戦相手のユニットを選択
    const [opponentTarget] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      '5000ダメージを与える相手のユニットを選択'
    );

    // 選んだユニットにダメージを与える
    Effect.damage(stack, stack.processing, ownTarget, 5000);
    Effect.damage(stack, stack.processing, opponentTarget, 5000);
  },
};
