import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 対戦相手のトリガーゾーンにカードがない場合、以下の効果が発動する。
  // このユニットがフィールドに出た時、対戦相手のユニットを1体選ぶ。それに3000ダメージを与える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のトリガーゾーンにカードがない場合のみ発動
    if (opponent.trigger.length > 0) {
      return;
    }

    // 対戦相手のユニットが選択可能か確認
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) {
      await System.show(stack, 'クリスマスマジック', '3000ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        'opponents',
        '3000ダメージを与えるユニットを選択'
      );
      Effect.damage(stack, stack.processing, target, 3000);
    }
  },

  // 対戦相手のトリガーゾーンにカードがない場合、以下の効果が発動する。
  // このユニットがアタックした時、対戦相手のユニットを1体選ぶ。それに4000ダメージを与える。
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のトリガーゾーンにカードがない場合のみ発動
    if (opponent.trigger.length > 0) {
      return;
    }

    // 対戦相手のユニットが選択可能か確認
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) {
      await System.show(stack, 'クリスマスマジック', '4000ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        'opponents',
        '4000ダメージを与えるユニットを選択'
      );
      Effect.damage(stack, stack.processing, target, 4000);
    }
  },
};
