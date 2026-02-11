import { Card, Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // インターセプトカードの発動条件チェック
  checkPlayerAttack: (stack: StackWithCard<Card>): boolean => {
    return (
      stack.processing.owner.life.current <= 1 &&
      stack.source instanceof Unit &&
      stack.source.owner.id !== stack.processing.owner.id &&
      stack.processing.owner.opponent.hand.length > 0
    );
  },
  // 忘却の遺跡：プレイヤーアタックを受けた時、ライフが1以下の場合、相手は手札を全て捨てる
  onPlayerAttack: async (stack: StackWithCard<Card>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    await System.show(stack, '忘却の遺跡', '手札を全て破壊');

    const opponentHand = [...opponent.hand];
    opponentHand.forEach(card => {
      Effect.break(stack, stack.processing, card);
    });
  },

  checkTurnStart: (stack: StackWithCard<Card>) => {
    return (
      stack.processing.owner.id === stack.core.getTurnPlayer().id &&
      stack.processing.owner.life.current <= 1 &&
      stack.processing.owner.opponent.trigger.length > 0
    );
  },
  // ターン開始時の効果
  onTurnStart: async (stack: StackWithCard<Card>): Promise<void> => {
    // 自分のターン開始時かつライフが1以下の場合に発動
    // 対戦相手のトリガーゾーンにあるカードを全て破壊
    const opponent = stack.processing.owner.opponent;

    await System.show(stack, '忘却の遺跡', 'トリガーゾーンのカードを全て破壊');

    const triggerCards = [...opponent.trigger]; // 配列のコピーを作成

    // トリガーカードがある場合、全て破壊
    triggerCards.forEach(card => {
      Effect.move(stack, stack.processing, card, 'trash');
    });
  },
};
