import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■アンフェア・タックス
  // 対戦相手のターン開始時、対戦相手の手札が7枚の場合、対戦相手の手札を2枚ランダムで捨てる。
  // NOTE: トリガーカードのチェッカーを実装
  checkTurnStart(stack: StackWithCard): boolean {
    const owner = stack.processing.owner;
    const turnPlayer = stack.core.getTurnPlayer();
    const opponent = owner.opponent;

    // 相手のターン開始時かつ手札が7枚の場合に発動
    return turnPlayer.id === opponent.id && opponent.hand.length === 7;
  },

  async onTurnStart(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 相手の手札が7枚であることを確認(念のため再チェック)
    if (opponent.hand.length === 7) {
      await System.show(stack, 'アンフェア・タックス', '手札を2枚捨てる');

      // ランダムで2枚選んで捨てる
      const cardsToDiscard = EffectHelper.random(opponent.hand, 2);
      for (const card of cardsToDiscard) {
        Effect.handes(stack, stack.processing, card);
      }
    }
  },
};
