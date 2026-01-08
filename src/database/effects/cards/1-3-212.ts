import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Parry } from '@/package/core/class/parry';

export const effects: CardEffects = {
  // ■失われた翼の対価
  // このユニットがフィールドに出た時、あなたの手札にあるトリガーカードを1枚ランダムで捨てる。そうした場合、このユニットに【スピードムーブ】を与える。
  // このユニットが戦闘した時、戦闘終了時まで全ての効果を発動できない。
  // このユニットがプレイヤーアタックに成功した時、このユニット以外のあなたのユニットを1体選ぶ。それを破壊する。そうした場合、対戦相手は自分の手札を1枚選んで捨て、あなたはカードを1枚引く。

  // フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 手札にトリガーカードがあるか確認
    const triggerCards = owner.hand.filter(card => card.catalog.type === 'trigger');

    if (triggerCards.length > 0) {
      // ランダムで1枚選ぶ
      const randomCards = EffectHelper.random(triggerCards, 1);
      if (randomCards.length > 0 && randomCards[0]) {
        const selectedCard = randomCards[0];
        await System.show(
          stack,
          '失われた翼の対価',
          'トリガーカードを捨て、【スピードムーブ】を付与'
        );
        Effect.move(stack, stack.processing, selectedCard, 'trash');
        Effect.speedMove(stack, stack.processing);
      }
    }
  },

  // 戦闘時の効果
  onBattleSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分自身の戦闘時のみ発動
    if (
      (stack.source instanceof Unit && stack.source.id === stack.processing.id) ||
      (stack.target instanceof Unit && stack.target.id === stack.processing.id)
    ) {
      await System.show(stack, '失われた翼の対価', '全ての効果を発動できない');
      throw new Parry(stack.processing);
    }
  },

  // プレイヤーアタック成功時の効果
  onPlayerAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 自分のユニットがプレイヤーアタックした時のみ発動
    if (
      stack.source instanceof Unit &&
      stack.source.id === stack.processing.id &&
      stack.target?.id === opponent.id
    ) {
      // 自分のユニットが他にいるか確認（このユニット以外のユニット）
      const ownUnits = owner.field.filter(unit => unit.id !== stack.processing.id);

      if (ownUnits.length > 0) {
        await System.show(
          stack,
          '失われた翼の対価',
          '味方ユニットを破壊\n手札を1枚破壊\nカードを1枚引く'
        );

        // 対象を選択可能なユニットを取得
        const filter = (unit: Unit) =>
          unit.owner.id === owner.id && unit.id !== stack.processing.id;

        if (EffectHelper.isUnitSelectable(stack.core, filter, owner)) {
          // ユニットを1体選択
          const [target] = await EffectHelper.pickUnit(
            stack,
            owner,
            filter,
            '破壊するユニットを選択'
          );

          // 相手の手札が1枚以上ある場合、1枚選んで捨てる
          if (opponent.hand.length > 0) {
            const [selectedCard] = await EffectHelper.selectCard(
              stack,
              opponent,
              opponent.hand,
              '捨てるカードを選択',
              1
            );

            if (selectedCard) {
              // 捨て札に移動
              Effect.move(stack, stack.processing, selectedCard, 'trash');
            }
          }

          // 選択したユニットを破壊
          Effect.break(stack, stack.processing, target);
          EffectTemplate.draw(stack.processing.owner, stack.core);
        }
      }
    }
  },
};
