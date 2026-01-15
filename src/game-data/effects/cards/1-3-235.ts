import type { Card } from '@/package/core/class/card';
import { Effect, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';

export const effects: CardEffects = {
  // トリガー: あなたのターン終了時、あなたのフィールドにユニットが0体以下の場合
  checkTurnEnd: (stack: StackWithCard<Card>): boolean => {
    return (
      stack.source.id === stack.processing.owner.id && stack.processing.owner.field.length === 0
    );
  },

  onTurnEnd: async (stack: StackWithCard<Card>): Promise<void> => {
    await System.show(stack, '雪解けの芽生え', 'カードを2枚引く\nCP+1');
    EffectTemplate.draw(stack.processing.owner, stack.core);
    EffectTemplate.draw(stack.processing.owner, stack.core);
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
  },
};
