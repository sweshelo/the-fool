import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 海底の宝物庫：フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 捨札から2枚ランダムで手札に加える
    const trashCards = stack.processing.owner.trash;

    if (trashCards.length > 0) {
      await System.show(stack, '海底の宝物庫', '捨札からカードを手札に加える');

      const randomCards = EffectHelper.random(trashCards, Math.min(2, trashCards.length));
      randomCards.forEach(card => {
        Effect.move(stack, stack.processing, card, 'hand');
      });
    }
  },

  // 対戦相手のユニットがアタックした時の効果
  onAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
    // アタックしているユニットが相手のユニットかチェック
    const attacker = stack.target as Unit;
    if (attacker.owner.id === stack.processing.owner.opponent.id) {
      // 自分のトリガーゾーンにカードがあるか確認
      const triggerCards = stack.processing.owner.trigger;

      if (triggerCards.length > 0) {
        await System.show(stack, '海底の宝物庫', 'トリガーカードを破壊\n相手ユニットを破壊');

        // トリガーゾーンからランダムで1枚選択して破壊
        const randomTriggers = EffectHelper.random(triggerCards, 1);
        randomTriggers.forEach(trigger => {
          Effect.move(stack, stack.processing, trigger, 'trash');
        });

        if (randomTriggers.length > 0) {
          // アタックしたユニットを破壊
          Effect.break(stack, stack.processing, attacker);
        }
      }
    }
  },

  // ターン終了時の効果
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターン終了時のみ発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      // トリガーゾーンが上限に達していないか確認
      const triggerCount = stack.processing.owner.trigger.length;
      const maxTrigger = stack.core.room.rule.player.max.trigger;

      if (triggerCount < maxTrigger && stack.processing.owner.deck.length > 0) {
        await System.show(stack, '海底の宝物庫', 'デッキからトリガーゾーンにセット');

        // デッキからランダムで1枚選んでトリガーゾーンにセット
        const randomCards = EffectHelper.random(stack.processing.owner.deck, 1);
        randomCards.forEach(card => {
          Effect.move(stack, stack.processing, card, 'trigger');
        });
      }
    }
  },
};
