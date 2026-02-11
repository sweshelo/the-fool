import { Card, Unit } from '@/package/core/class/card';
import { Color } from '@/submodule/suit/constant/color';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■神慌意乱
  // あなたが効果によって対戦相手のユニットにダメージを与えた時、
  // 対戦相手のユニットを1体選ぶ。それに2000ダメージを与える。
  // あなたのデッキから1枚ランダムであなたのトリガーゾーンに赤属性のインターセプトカードをセットする。

  checkDamage: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    // 自分がダメージを与えた側であり、対象が対戦相手のユニットであることを確認
    return (
      stack.source instanceof Card &&
      stack.source.owner.id === stack.processing.owner.id &&
      stack.target instanceof Unit &&
      stack.target.owner.id !== stack.processing.owner.id &&
      // 効果発動の条件を確認
      (EffectHelper.isUnitSelectable(stack.core, 'opponents', owner) ||
        owner.trigger.length < stack.core.room.rule.player.max.trigger)
    );
  },

  onDamage: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    await EffectHelper.combine(stack, [
      {
        title: '神慌意乱',
        description: '2000ダメージ',
        effect: async () => {
          // 対戦相手のユニットを1体選ぶ
          const [target] = await EffectHelper.pickUnit(
            stack,
            owner,
            'opponents',
            'ダメージを与えるユニットを選択'
          );
          // 2000ダメージを与える
          Effect.damage(stack, stack.processing, target, 2000);
        },
        condition: EffectHelper.isUnitSelectable(stack.core, 'opponents', owner),
      },
      {
        title: '神慌意乱',
        description: '赤属性のインターセプトカードをセット',
        effect: () => {
          // デッキから赤属性のインターセプトカードを抽出
          const redIntercepts = owner.deck.filter(
            card => card.catalog.type === 'intercept' && card.catalog.color === Color.RED
          );
          EffectHelper.random(redIntercepts, 1).forEach(card =>
            Effect.move(stack, stack.processing, card, 'trigger')
          );
        },
        condition: owner.trigger.length < stack.core.room.rule.player.max.trigger,
      },
    ]);
  },
};
