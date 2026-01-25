import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■死生反転
  // あなたのターン開始時、お互いのプレイヤーはデッキのカードと捨札のカードを入れ替える。
  checkTurnStart: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のターン開始時のみ発動
    return stack.core.getTurnPlayer().id === owner.id;
  },

  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '死生反転', 'デッキと捨札を入れ替える');

    // お互いのプレイヤーのデッキと捨札を入れ替える
    stack.core.players.forEach(player => {
      const deckCards = [...player.deck];
      const trashCards = [...player.trash];

      // 捨札のカードをデッキへ
      trashCards.forEach(card => {
        Effect.move(stack, stack.processing, card, 'deck');
      });

      // デッキのカードを捨札へ
      deckCards.forEach(card => {
        Effect.move(stack, stack.processing, card, 'trash');
      });

      // デッキをシャッフル
      player.deck.splice(0, player.deck.length, ...EffectHelper.shuffle(player.deck));
    });
  },
};
