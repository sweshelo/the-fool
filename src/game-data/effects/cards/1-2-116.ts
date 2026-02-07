import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■無慈悲な冷笑
  // このユニットがフィールドに出た時、以下の効果が発動する。
  // お互いのプレイヤーは手札を１枚ランダムで捨てる。
  // お互いのプレイヤーはトリガーゾーンにあるカードを１枚ランダムで破壊する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(stack, '無慈悲な冷笑', '手札を1枚破壊\nトリガーゾーンのカードを1枚破壊');

    // お互いの手札を1枚ランダムで捨てる
    for (const player of [owner, opponent]) {
      if (player.hand.length > 0) {
        const cards = EffectHelper.random(player.hand, 1);
        if (cards[0]) Effect.break(stack, stack.processing, cards[0]);
      }
    }

    // お互いのトリガーゾーンのカードを1枚ランダムで破壊する
    for (const player of [owner, opponent]) {
      if (player.trigger.length > 0) {
        const cards = EffectHelper.random(player.trigger, 1);
        if (cards[0]) Effect.break(stack, stack.processing, cards[0]);
      }
    }
  },
};
