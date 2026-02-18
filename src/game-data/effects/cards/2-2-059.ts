import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // ■カーネージ
  // あなたのユニットがフィールドに出た時、あなたのフィールドに赤属性ユニットがいる場合、対戦相手のユニットを1体選ぶ。それに【オーバーヒート】を与え、1500ダメージを与える。そうした場合、あなたの紫ゲージを+1する。
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のユニットが出た時のみ発動
    if (stack.source.id !== owner.id) return false;

    // 赤属性ユニットがいるか確認
    const hasRed = owner.field.some(unit => unit.catalog.color === Color.RED);
    if (!hasRed) return false;

    // 対戦相手にユニットがいるか確認
    return EffectHelper.isUnitSelectable(stack.core, 'opponents', owner);
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, 'カーネージ', '【オーバーヒート】と1500ダメージ\n紫ゲージ+1');

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      '【オーバーヒート】と1500ダメージを与えるユニットを選択'
    );

    // オーバーヒートを与える
    Effect.keyword(stack, stack.processing, target, 'オーバーヒート');

    // 1500ダメージを与える
    Effect.damage(stack, stack.processing, target, 1500);

    // 紫ゲージを+1する
    await Effect.modifyPurple(stack, stack.processing, owner, 1);
  },
};
