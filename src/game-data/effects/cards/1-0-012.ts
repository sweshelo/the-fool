import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  //■デーモンスピア
  //このユニットがフィールドに出た時、対戦相手のユニットを1体選ぶ。それに4000ダメージを与える。
  //■トリガーロスト
  //このユニットがアタックした時、対戦相手のトリガーゾーンにあるカードを1枚ランダムで破壊する。

  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) {
      return;
    }

    await System.show(stack, 'デーモンスピア', '対戦相手のユニットに4000ダメージ');

    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      'ダメージを与えるユニットを選択'
    );

    Effect.damage(stack, stack.processing, target, 4000);
  },

  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    //対戦相手のトリガーゾーンにカードがあるか確認
    if (opponent.trigger.length === 0) return;

    await System.show(stack, 'トリガーロスト', 'トリガーゾーンのカードを破壊');

    // ランダムで1枚選択して破壊
    EffectHelper.random(opponent.trigger, 1).forEach(card =>
      Effect.move(stack, stack.processing, card, 'trash')
    );
  },
};
