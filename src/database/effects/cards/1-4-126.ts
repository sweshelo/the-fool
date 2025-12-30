import type { Card } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■聖典の恩恵
  // あなたのターン開始時、あなたのCPを+［対戦相手のトリガーゾーンにあるカードの枚数×1］する。
  // あなたのターン終了時、あなたのCPを+［対戦相手の手札の枚数×1］する。
  checkTurnStart: (stack: StackWithCard<Card>): boolean => {
    // 自分のターン開始時のみ発動
    return stack.source.id === stack.processing.owner.id;
  },

  onTurnStart: async (stack: StackWithCard<Card>): Promise<void> => {
    // 対戦相手のトリガーゾーンのカード枚数
    const triggerCount = stack.processing.owner.opponent.trigger.length;

    if (triggerCount > 0) {
      await System.show(stack, '聖典の恩恵', `CP+${triggerCount}`);
      Effect.modifyCP(stack, stack.processing, stack.processing.owner, triggerCount);
    }
  },

  checkTurnEnd: (stack: StackWithCard<Card>): boolean => {
    // 自分のターン終了時のみ発動
    return stack.source.id === stack.processing.owner.id;
  },

  onTurnEnd: async (stack: StackWithCard<Card>): Promise<void> => {
    // 対戦相手の手札の枚数
    const handCount = stack.processing.owner.opponent.hand.length;

    if (handCount > 0) {
      await System.show(stack, '聖典の恩恵', `CP+${handCount}`);
      Effect.modifyCP(stack, stack.processing, stack.processing.owner, handCount);
    }
  },
};
