import { Card } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // トリガー効果の発動条件チェック
  checkTurnStart: (stack: StackWithCard) => {
    // 自分のターン開始時かつフィールドにユニットが0体以下の場合に発動
    return (
      stack.processing.owner.id === stack.core.getTurnPlayer().id &&
      stack.processing.owner.field.length <= 0
    );
  },

  // 聖女の祈り：ターン開始時、フィールドにユニットが0体以下の場合、カードを1枚引く、CPを+1する
  onTurnStart: async (stack: StackWithCard<Card>): Promise<void> => {
    // 自分のターン開始時のみ発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      // フィールドにユニットが0体以下かチェック
      if (stack.processing.owner.field.length <= 0) {
        await System.show(stack, '聖女の祈り', 'カードを1枚引く\nCP+1');

        // カードを1枚引く
        EffectTemplate.draw(stack.processing.owner, stack.core);

        // CPを+1する
        Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
      }
    }
  },
};
