import { Card, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■トリガーロスト
  // あなたのターン終了時、対戦相手のトリガーゾーンにあるカードを1枚ランダムで破壊する。
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分のターン終了時のみ発動
    if (owner.id === stack.core.getTurnPlayer().id) {
      const opponent = owner.opponent;

      // 対戦相手のトリガーゾーンにカードがあるか確認
      if (opponent.trigger.length > 0) {
        await System.show(stack, 'トリガーロスト', 'トリガーカードを破壊');

        // ランダムで1枚選択して破壊
        EffectHelper.random(opponent.trigger, 1).forEach(card =>
          Effect.move(stack, stack.processing, card, 'trash')
        );
      }
    }
  },

  // ■龍機の覚醒め
  // 対戦相手のトリガーゾーンにあるカードを破壊した時、このユニットの行動権を回復する。
  onLost: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分が破壊したカードである場合に発動
    if (
      stack.source instanceof Card &&
      stack.source.owner.id === owner.id && // 効果の発生源が自分である
      stack.target instanceof Card &&
      stack.target.owner.id === owner.opponent.id // 破壊されたカードの所有者が対戦相手である
    ) {
      await System.show(stack, '龍機の覚醒め', '行動権を回復');
      Effect.activate(stack, stack.processing, stack.processing, true);
    }
  },
};
