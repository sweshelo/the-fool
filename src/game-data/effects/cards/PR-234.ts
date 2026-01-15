import { Card, Unit } from '@/package/core/class/card';
import { Color } from '@/submodule/suit/constant/color';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■神慌意乱
  // あなたが効果によって対戦相手のユニットにダメージを与えた時、
  // 対戦相手のユニットを1体選ぶ。それに2000ダメージを与える。
  // あなたのデッキから1枚ランダムであなたのトリガーゾーンに赤属性のインターセプトカードをセットする。

  checkDamage: (stack: StackWithCard): boolean => {
    // 自分がダメージを与えた側であり、対象が対戦相手のユニットであることを確認
    return (
      stack.source instanceof Card &&
      stack.source.owner.id === stack.processing.owner.id &&
      stack.target instanceof Unit &&
      stack.target.owner.id !== stack.processing.owner.id
    );
  },

  onDamage: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    // 対戦相手のフィールドにユニットがいるか確認
    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) return;

    await System.show(stack, '神慌意乱', '2000ダメージ\n赤属性のインターセプトカードをセット');

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      'ダメージを与えるユニットを選択'
    );

    // 2000ダメージを与える
    Effect.damage(stack, stack.processing, target, 2000);

    // トリガーゾーンに空きがあるか確認
    if (owner.trigger.length >= stack.core.room.rule.player.max.trigger) return;

    // デッキから赤属性のインターセプトカードを抽出
    const redIntercepts = owner.deck.filter(
      card => card.catalog.type === 'intercept' && card.catalog.color === Color.RED
    );

    // ランダムで1枚セット
    if (redIntercepts.length > 0) {
      EffectHelper.random(redIntercepts, 1).forEach(card =>
        Effect.move(stack, stack.processing, card, 'trigger')
      );
    }
  },
};
