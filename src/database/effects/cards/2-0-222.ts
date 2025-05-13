import { System } from '..';
import { Delta } from '@/package/core/class/delta';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■大航海時代
  // あなたのターン開始時、あなたの手札にある元のコストが2以上のカードのコストをターン終了時まで-1する。

  // トリガーカードの発動条件
  checkTurnStart: (stack: StackWithCard): boolean => {
    // このカードの所有者のターン開始時のみ発動
    return stack.source.id === stack.processing.owner.id;
  },

  // 実際の効果
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    // 手札にある元のコストが2以上のカード
    const targets = owner.hand.filter(card => card.catalog.cost >= 2);

    if (targets.length > 0) {
      await System.show(stack, '大航海時代', '手札のコスト-1');

      // 各対象カードにコスト-1のDeltaを適用
      targets.forEach(card => {
        card.delta.push(
          new Delta(
            { type: 'cost', value: -1 },
            { event: 'turnEnd', count: 1, onlyForOwnersTurn: true }
          )
        );
      });
    }
  },
};
