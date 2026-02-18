import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■クロック・アップ
  // このユニット以外のあなたの【不死】ユニットが破壊されるたび、このユニットのレベルを+1する。
  // ■絶望の略奪
  // このユニットがクロックアップするたび、対戦相手は手札を1枚ランダムで捨てる。

  // 不死ユニットが破壊された時の効果
  onBreak: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 破壊されたのが自分の不死ユニットかつこのユニット以外かつトリガーでないかチェック
    if (
      stack.target instanceof Unit &&
      stack.target.owner.id === owner.id &&
      stack.target.id !== stack.processing.id &&
      stack.target.catalog.species?.includes('不死')
    ) {
      // レベルが3未満の場合のみ処理（レベルの上限は3）
      if (stack.processing.lv < 3) {
        await System.show(stack, 'クロック・アップ', 'レベル+1');
        Effect.clock(stack, stack.processing, stack.processing, 1);
      }
    }
  },

  // クロックアップした時の効果
  onClockupSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    // 相手の手札が0枚の場合は効果を発動しない
    if (opponent.hand.length === 0) return;

    await System.show(stack, '絶望の略奪', '手札を1枚破壊');

    // 相手の手札からランダムで1枚選択
    const [targetCards] = EffectHelper.random(opponent.hand, 1);
    if (targetCards) {
      // 選んだカードを捨てる
      Effect.break(stack, stack.processing, targetCards);
    }
  },
};
