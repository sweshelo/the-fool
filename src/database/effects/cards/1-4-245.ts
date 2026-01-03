import type { Card } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■神の見えざる手
  // あなたのターン開始時、対戦相手のライフがあなたのライフより4以上多い場合、対戦相手に1ライフダメージを与える。
  // あなたのターン終了時、対戦相手のライフがあなたのライフより6以上多い場合、対戦相手に2ライフダメージを与える。
  checkTurnStart: (stack: StackWithCard<Card>): boolean => {
    // 自分のターン開始時かつライフ差が4以上の場合のみ発動
    const lifeDiff =
      stack.processing.owner.opponent.life.current - stack.processing.owner.life.current;
    return stack.source.id === stack.processing.owner.id && lifeDiff >= 4;
  },

  onTurnStart: async (stack: StackWithCard<Card>): Promise<void> => {
    await System.show(stack, '神の見えざる手', '1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
  },

  checkTurnEnd: (stack: StackWithCard<Card>): boolean => {
    // 自分のターン終了時かつライフ差が6以上の場合のみ発動
    const lifeDiff =
      stack.processing.owner.opponent.life.current - stack.processing.owner.life.current;
    return stack.source.id === stack.processing.owner.id && lifeDiff >= 6;
  },

  onTurnEnd: async (stack: StackWithCard<Card>): Promise<void> => {
    await System.show(stack, '神の見えざる手', '2ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -2);
  },
};
