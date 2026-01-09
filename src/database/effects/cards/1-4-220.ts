import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■天使のわっか
  // このユニットがフィールドに出た時、対戦相手は自分の手札を1枚選んで捨てる。

  // フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    // 相手の手札が0枚の場合は何もしない
    if (opponent.hand.length === 0) return;

    await System.show(stack, '天使のわっか', '相手は手札を1枚捨てる');

    // 相手に手札を1枚選ばせる
    const [selectedCard] = await EffectHelper.selectCard(
      stack,
      opponent,
      opponent.hand,
      '捨てるカードを選択',
      1
    );

    // 選んだカードを捨てる
    Effect.handes(stack, stack.processing, selectedCard);
  },
};
