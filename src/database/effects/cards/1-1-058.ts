import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■暗黒街の武器商人
  // あなたのターン終了時、あなたはカードを1枚引き、CPを+1する。
  // NOTE: トリガーカードのチェッカーを実装
  checkTurnEnd(stack: StackWithCard): boolean {
    const owner = stack.processing.owner;
    const turnPlayer = stack.core.getTurnPlayer();

    // 自分のターン終了時に発動
    return owner.id === turnPlayer.id;
  },

  async onTurnEnd(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;

    await System.show(stack, '暗黒街の武器商人', 'カードを1枚引く\nCP+1');

    // カードを1枚引く
    if (owner.deck.length > 0 && owner.hand.length < stack.core.room.rule.player.max.hand) {
      const cardToDraw = owner.deck[0];
      if (cardToDraw) {
        Effect.move(stack, stack.processing, cardToDraw, 'hand');
      }
    }

    // CPを+1する
    Effect.modifyCP(stack, stack.processing, owner, 1);
  },
};
