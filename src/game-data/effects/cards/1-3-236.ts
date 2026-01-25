import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■精神統一
  // あなたのユニットが戦闘した時、そのユニットが戦闘中の相手ユニットとBPが同じ場合、戦闘中の相手ユニットを消滅させ、あなたのCPを+2する。
  checkBattle: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のユニットが戦闘しているか確認
    const ownUnit = [stack.source, stack.target].find(
      (object): object is Unit => object instanceof Unit && object.owner.id === owner.id
    );

    const opponentUnit = [stack.source, stack.target].find(
      (object): object is Unit => object instanceof Unit && object.owner.id !== owner.id
    );

    if (!ownUnit || !opponentUnit) return false;

    // BPが同じか確認
    return ownUnit.currentBP === opponentUnit.currentBP;
  },

  onBattle: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    // 相手ユニットを特定
    const opponentUnit = [stack.source, stack.target].find(
      (object): object is Unit => object instanceof Unit && object.owner.id !== owner.id
    );

    if (!opponentUnit) return;

    await System.show(stack, '精神統一', '相手ユニットを消滅\nCP+2');

    // 戦闘中の相手ユニットを消滅させる
    Effect.delete(stack, stack.processing, opponentUnit);

    // CPを+2する
    Effect.modifyCP(stack, stack.processing, owner, 2);
  },

  // あなたのターン開始時、あなたの手札が6枚以下の場合、デッキから2枚ランダムで見る。その中から1枚選び、それを手札に加える。残りの1枚のカードは捨札に送る。
  checkTurnStart: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のターン開始時のみ発動
    if (stack.core.getTurnPlayer().id !== owner.id) return false;

    // 手札が6枚以下か確認
    if (owner.hand.length > 6) return false;

    // デッキに2枚以上あるか確認
    return owner.deck.length >= 2;
  },

  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, '精神統一', 'デッキから2枚見て1枚手札に加える');

    // デッキから2枚ランダムで選ぶ
    const randomCards = EffectHelper.random(owner.deck, 2);

    if (randomCards.length < 2) return;

    // プレイヤーに1枚選ばせる
    const [selectedCard] = await EffectHelper.selectCard(
      stack,
      owner,
      randomCards,
      '手札に加えるカードを選択'
    );

    // 選んだカードを手札に加える
    Effect.move(stack, stack.processing, selectedCard, 'hand');

    // 残りのカードを捨札に送る
    const remainingCard = randomCards.find(c => c.id !== selectedCard.id);
    if (remainingCard) {
      Effect.move(stack, stack.processing, remainingCard, 'trash');
    }
  },
};
