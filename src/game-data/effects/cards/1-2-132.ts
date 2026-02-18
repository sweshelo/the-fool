import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 伝説の奇術師：プレイヤーアタック関連の効果
  checkPlayerAttack: (stack: StackWithCard) => {
    return stack.source instanceof Unit && stack.processing.owner.id === stack.source.owner.id
      ? stack.processing.owner.hand.length > 0
      : true;
  },

  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    // attacker（プレイヤーアタックを行ったユニット）のチェック
    const attacker = stack.source;
    if (!(attacker instanceof Unit)) return;

    // 自分のユニットがプレイヤーアタックに成功した時
    if (attacker.owner.id === stack.processing.owner.id) {
      await System.show(stack, '伝説の奇術師', '手札を消滅\n捨札からトリガーカードを手札に加える');

      // 自分の手札を表示して選択肢を提示
      if (stack.processing.owner.hand.length > 0) {
        const [selectedCard] = await EffectHelper.selectCard(
          stack,
          stack.processing.owner,
          stack.processing.owner.hand,
          '消滅させる手札を選択'
        );

        // 選択したカードを消滅させる
        Effect.move(stack, stack.processing, selectedCard, 'delete');

        // 捨札からトリガーカードを2枚までランダムで手札に加える
        const triggerCards = stack.processing.owner.trash.filter(
          card => card.catalog.type === 'trigger'
        );

        const randomCards = EffectHelper.random(triggerCards, Math.min(2, triggerCards.length));
        randomCards.forEach(card => {
          Effect.move(stack, stack.processing, card, 'hand');
        });
      }
    }
    // 自分がプレイヤーアタックを受けた時
    else if (attacker.owner.id === stack.processing.owner.opponent.id) {
      await System.show(stack, '伝説の奇術師', 'デッキからトリガーカードを手札に加える');

      // デッキからトリガーカードを2枚までランダムで手札に加える
      const triggerCards = stack.processing.owner.deck.filter(
        card => card.catalog.type === 'trigger'
      );

      const randomCards = EffectHelper.random(triggerCards, Math.min(2, triggerCards.length));
      randomCards.forEach(card => {
        Effect.move(stack, stack.processing, card, 'hand');
      });
    }
  },
};
