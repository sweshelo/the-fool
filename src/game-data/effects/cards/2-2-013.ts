import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■月光霞隠れ
  // 対戦相手のターン開始時、対戦相手の手札が4枚以上の場合、このユニットを手札に戻す。そうした場合、対戦相手は自分の手札を1枚選んで捨てる。
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のターン開始時のみ発動
    if (stack.core.getTurnPlayer().id !== opponent.id) return;

    // 対戦相手の手札が4枚以上でなければ発動しない
    if (opponent.hand.length < 4) return;

    await System.show(stack, '月光霞隠れ', '手札に戻る\n相手は手札を1枚捨てる');

    // このユニットを手札に戻す
    Effect.bounce(stack, stack.processing, stack.processing, 'hand');

    // 対戦相手は自分の手札を1枚選んで捨てる
    if (opponent.hand.length > 0) {
      const [selectedCard] = await EffectHelper.selectCard(
        stack,
        opponent,
        opponent.hand,
        '捨てるカードを選択',
        1
      );

      Effect.break(stack, stack.processing, selectedCard);
    }
  },
};
