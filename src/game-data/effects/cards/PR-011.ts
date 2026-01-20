import type { Card } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';

export const effects: CardEffects = {
  // トリガー: あなたのターン終了時
  checkTurnEnd: (stack: StackWithCard<Card>): boolean => {
    return stack.source.id === stack.processing.owner.id;
  },

  onTurnEnd: async (stack: StackWithCard<Card>): Promise<void> => {
    await System.show(stack, '忘れられし地下書庫', '手札を1枚捨てる\nカードを2枚引く');
    if (stack.processing.owner.hand.length > 0) {
      const [card] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        stack.processing.owner.hand,
        '捨てるカードを選択',
        1
      );
      Effect.handes(stack, stack.processing, card);
    }
    EffectTemplate.draw(stack.processing.owner, stack.core);
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
