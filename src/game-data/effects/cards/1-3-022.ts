import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■ラブリィ・マミー
  // 対戦相手の手札が2枚以下の場合、以下の効果が発動する。
  // このユニットがフィールドに出た時、あなたの捨札にあるカードを1枚ランダムで手札に加える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手の手札が2枚以下でなければ発動しない
    if (opponent.hand.length > 2) return;

    // 捨札がなければ発動しない
    if (owner.trash.length === 0) return;

    await System.show(stack, 'ラブリィ・マミー', '捨札から1枚回収');

    // ランダムで1枚選んで手札に加える
    EffectHelper.random(owner.trash, 1).forEach(card => {
      Effect.move(stack, stack.processing, card, 'hand');
    });
  },

  // このユニットが破壊された時、対戦相手に1ライフダメージを与える。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手の手札が2枚以下でなければ発動しない
    if (opponent.hand.length > 2) return;

    await System.show(stack, 'ラブリィ・マミー', '1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, opponent, -1);
  },
};
