import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // ■魔弾
  // あなたのユニットがフィールドに出た時、あなたのフィールドにユニットが4体以下で、あなたのフィールドに黄属性ユニットがいる場合、対戦相手のコスト7以下のユニットを1体選ぶ。それをあなたのフィールドに【複製】する。そうした場合、あなたの紫ゲージを+1する。
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 自分のユニットが出た時のみ発動
    if (stack.source.id !== owner.id) return false;

    // フィールドのユニットが4体以下か確認
    if (owner.field.length > 4) return false;

    // 黄属性ユニットがいるか確認
    const hasYellow = owner.field.some(unit => unit.catalog.color === Color.YELLOW);
    if (!hasYellow) return false;

    // 対戦相手にコスト7以下のユニットがいるか確認
    const hasTarget = opponent.field.some(unit => unit.catalog.cost <= 7);
    return hasTarget;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    const filter = (unit: Unit) => unit.owner.id !== owner.id && unit.catalog.cost <= 7;

    await System.show(stack, '魔弾', 'ユニットを【複製】\n紫ゲージ+1');

    // 対戦相手のコスト7以下のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      filter,
      '【複製】するユニットを選択'
    );

    // 複製する
    await Effect.clone(stack, stack.processing, target, owner);

    // 紫ゲージを+1する
    await Effect.modifyPurple(stack, stack.processing, owner, 1);
  },
};
