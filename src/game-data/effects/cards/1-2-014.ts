import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、対戦相手のトリガーゾーンにあるカードを2枚ランダムで破壊する。
  // 対戦相手のトリガーゾーンにカードがない場合、あなたのデッキからランダムで1枚トリガーゾーンにインターセプトカードをセットする。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    if (opponent.trigger.length > 0) {
      // 対戦相手のトリガーゾーンにカードがある場合、2枚ランダムで破壊
      await System.show(stack, '堕天使の鎮魂歌', 'トリガーゾーンのカードを2枚破壊');

      const cardsToDestroy = EffectHelper.random(
        opponent.trigger,
        Math.min(2, opponent.trigger.length)
      );
      cardsToDestroy.forEach(card => Effect.break(stack, stack.processing, card));
    } else {
      // 対戦相手のトリガーゾーンにカードがない場合、デッキからインターセプトカードをセット
      const interceptCards = owner.deck.filter(card => card.catalog.type === 'intercept');

      if (
        interceptCards.length > 0 &&
        owner.trigger.length < stack.core.room.rule.player.max.trigger
      ) {
        await System.show(stack, '堕天使の鎮魂歌', 'インターセプトカードをトリガーゾーンにセット');

        const [cardToSet] = EffectHelper.random(interceptCards, 1);
        if (cardToSet) {
          Effect.move(stack, stack.processing, cardToSet, 'trigger');
        }
      }
    }
  },

  // このユニットがアタックした時、対戦相手の全てのレベル2以上のユニットに6000ダメージを与える。
  // あなたのレベル2以上のユニットに【スピードムーブ】を与える。
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のレベル2以上のユニット
    const opponentTargets = opponent.field.filter(unit => unit.lv >= 2);

    // 自分のレベル2以上のユニット
    const ownTargets = owner.field.filter(unit => unit.lv >= 2);

    await EffectHelper.combine(stack, [
      {
        title: '堕天使の鎮魂歌',
        description: '敵のレベル2以上に6000ダメージ',
        effect: () =>
          opponentTargets.forEach(unit => Effect.damage(stack, stack.processing, unit, 6000)),
        condition: opponentTargets.length > 0,
      },
      {
        title: '堕天使の鎮魂歌',
        description: '味方のレベル2以上に【スピードムーブ】',
        effect: () => ownTargets.forEach(unit => Effect.speedMove(stack, unit)),
        condition: ownTargets.length > 0,
      },
    ]);
  },
};
