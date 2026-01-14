import { Card } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // トリガーカードのチェック関数
  // ユニットがフィールドに出た時に発動するトリガーなので、checkDriveメソッドを実装
  checkDrive: (stack: StackWithCard<Card>): boolean => {
    // フィールド上のユニット数をカウント
    const allUnits: Card[] = [];

    // 安全にプレイヤーのフィールドを取得
    if (stack.core.players && stack.core.players.length > 0) {
      stack.core.players.forEach(player => {
        if (player && player.field) {
          allUnits.push(...player.field);
        }
      });
    }

    // フィールドにユニットが9体以上いる場合に発動
    return allUnits.length >= 9;
  },

  // ユニットがフィールドに出た時、フィールドにユニットが9体以上いる場合、お互いのプレイヤーは手札を全て捨てる。
  onDrive: async (stack: StackWithCard<Card>): Promise<void> => {
    await System.show(stack, '拒絶する世界', '手札を全て捨てる');

    // 両プレイヤーの手札を捨札に送る
    const players = stack.core.players;

    for (const player of players) {
      // 手札をコピー（後でループ中に配列を変更するため）
      const handCopy = [...player.hand];

      // 手札を全て捨てる
      for (const card of handCopy) {
        Effect.handes(stack, stack.processing, card);
      }
    }
  },
};
