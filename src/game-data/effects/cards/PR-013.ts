import { Unit } from '@/package/core/class/card';
import { Color } from '@/submodule/suit/constant/color';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 対戦相手の赤属性以外のユニットを1体選ぶ。それに4000ダメージを与える。
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const filter = (unit: Unit) =>
      unit.owner.id !== stack.processing.owner.id && unit.catalog.color !== Color.RED;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, '魔校マニフェスト', '4000ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        'ダメージを与えるユニットを選択して下さい',
        1
      );
      Effect.damage(stack, stack.processing, target, 4000, 'effect', '魔校マニフェスト');
    }
  },

  // あなたのデッキから1枚ランダムであなたのトリガーゾーンに赤属性のインターセプトカードをセットする。
  onBreak: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 自分の効果で破壊されたかチェック
    if (
      stack.source.id === stack.processing.id &&
      stack.target instanceof Unit &&
      stack.target.owner.id === opponent.id &&
      stack.target.delta.some(
        delta => delta.effect.type === 'damage' && delta.source?.effectCode === '魔校マニフェスト'
      )
    ) {
      // トリガーゾーンに空きがあるか確認
      if (owner.trigger.length >= stack.core.room.rule.player.max.trigger) return;

      // デッキ内の赤属性のインターセプトカード
      const intercepts = owner.deck.filter(
        card => card.catalog.type === 'intercept' && card.catalog.color === Color.RED
      );

      await System.show(stack, '魔校マニフェスト', '赤属性のインターセプトカードをセット');

      EffectHelper.random(intercepts, 1).forEach(card =>
        Effect.move(stack, stack.processing, card, 'trigger')
      );
    }
  },
};
