import type { Card } from '@/package/core/class/card';
import { Effect, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';

export const effects: CardEffects = {
  // インターセプト: あなたのターン開始時、あなたのフィールドにユニットが0体以下の場合
  checkTurnStart: (stack: StackWithCard<Card>): boolean => {
    return (
      stack.source.id === stack.processing.owner.id && stack.processing.owner.field.length === 0
    );
  },

  onTurnStart: async (stack: StackWithCard<Card>): Promise<void> => {
    const card = stack.processing;

    // レベルに応じて効果が変わる
    switch (card.lv) {
      case 1:
        await System.show(stack, '再起への第一歩', 'カードを2枚引く');
        EffectTemplate.draw(card.owner, stack.core);
        EffectTemplate.draw(card.owner, stack.core);
        break;

      case 2:
        await System.show(stack, '再起への第一歩', 'カードを2枚引く\nCP+1');
        EffectTemplate.draw(card.owner, stack.core);
        EffectTemplate.draw(card.owner, stack.core);
        Effect.modifyCP(stack, card, card.owner, 1);
        break;

      case 3:
        await System.show(stack, '再起への第一歩', 'カードを2枚引く\nCP+2');
        EffectTemplate.draw(card.owner, stack.core);
        EffectTemplate.draw(card.owner, stack.core);
        Effect.modifyCP(stack, card, card.owner, 2);
        break;
    }
  },
};
