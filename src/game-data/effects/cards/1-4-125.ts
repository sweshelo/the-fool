import { Card, Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 忘却の遺跡：プレイヤーアタックを受けた時、ライフが1以下の場合、相手は手札を全て捨てる
  onPlayerAttack: async (stack: StackWithCard<Card>): Promise<void> => {
    // プレイヤーアタックの発生元が対戦相手か確認
    const attacker = stack.source;
    if (attacker instanceof Unit && attacker.owner.id === stack.processing.owner.opponent.id) {
      // 自分のライフが1以下かチェック
      if (stack.processing.owner.life.current <= 1) {
        await System.show(stack, '忘却の遺跡', '手札を全て破壊');

        // 対戦相手の手札を全て捨てる
        const opponent = stack.processing.owner.opponent;
        const opponentHand = [...opponent.hand]; // 配列のコピーを作成

        // 手札がある場合、全て捨てる
        opponentHand.forEach(card => {
          Effect.handes(stack, stack.processing, card);
        });
      }
    }
  },

  // ターン開始時の効果
  onTurnStart: async (stack: StackWithCard<Card>): Promise<void> => {
    // 自分のターン開始時かつライフが1以下の場合に発動
    await System.show(stack, '忘却の遺跡', 'トリガーゾーンのカードを全て破壊');

    // 対戦相手のトリガーゾーンにあるカードを全て破壊
    const opponent = stack.processing.owner.opponent;
    const triggerCards = [...opponent.trigger]; // 配列のコピーを作成

    // トリガーカードがある場合、全て破壊
    triggerCards.forEach(card => {
      Effect.move(stack, stack.processing, card, 'trash');
    });
  },

  // インターセプトカードの発動条件チェック
  checkPlayerAttack: (stack: StackWithCard<Card>): boolean => {
    // カードの所有者のライフが1以下の場合に発動
    return (
      stack.processing.owner.life.current <= 1 &&
      stack.source instanceof Unit &&
      stack.source.owner.id !== stack.processing.owner.id
    );
  },

  checkTurnStart: (stack: StackWithCard<Card>) => {
    return (
      stack.processing.owner.id === stack.core.getTurnPlayer().id &&
      stack.processing.owner.life.current <= 1
    );
  },
};
