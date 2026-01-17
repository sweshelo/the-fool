import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ［▲3］あなたのユニットがフィールドに出た時、あなたの紫ゲージが3以上の場合、
  // 対戦相手のユニットを1体選ぶ。そのユニットにデスカウンター［1］を与える。あなたはカードを1枚引く。
  //
  // ［▲3］対戦相手のユニットがフィールドに出た時、あなたの紫ゲージが3以上の場合、
  // そのユニットを破壊する。あなたの紫ゲージを-3する。

  checkDrive: (stack: StackWithCard) => {
    if (!(stack.target instanceof Unit)) return false;
    if ((stack.processing.owner.purple ?? 0) < 3) return false;

    // 自分のユニットが出た場合
    if (stack.target.owner.id === stack.processing.owner.id) {
      return true;
    }

    // 対戦相手のユニットが出た場合
    if (stack.target.owner.id !== stack.processing.owner.id) {
      return true;
    }

    return false;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.target instanceof Unit)) return;

    const owner = stack.processing.owner;

    // 自分のユニットが出た場合の効果
    if (stack.target.owner.id === owner.id) {
      // 対戦相手のフィールドにユニットがいるか確認
      if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) return;

      await System.show(stack, '死んでくれる？', 'デスカウンター[1]\nカードを1枚引く');

      // 対戦相手のユニットを1体選ぶ
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        'opponents',
        'デスカウンターを与えるユニットを選択'
      );

      // デスカウンター[1]を与える
      Effect.death(stack, stack.processing, target, 1);

      // カードを1枚引く
      EffectTemplate.draw(owner, stack.core);
    }

    // 対戦相手のユニットが出た場合の効果
    if (stack.target.owner.id !== owner.id) {
      await System.show(stack, '死んでくれる？', '破壊\n紫ゲージ-3');

      // そのユニットを破壊する
      Effect.break(stack, stack.processing, stack.target);

      // 紫ゲージを-3する
      await Effect.modifyPurple(stack, stack.processing, owner, -3);
    }
  },
};
