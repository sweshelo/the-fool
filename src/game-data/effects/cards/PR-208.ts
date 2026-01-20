import { Unit } from '@/package/core/class/card';
import type { Card } from '@/package/core/class/card/Card';
import { System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard<Card>): boolean => {
    // 自分のユニットが召喚された場合のみ発動
    return stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id;
  },

  onDrive: async (stack: StackWithCard<Unit>): Promise<void> => {
    const selfLevel = stack.processing.lv;

    // 手札のトリガーカード・インターセプトカードを取得
    const handCards = stack.processing.owner.hand.filter(
      card => card.catalog.type === 'trigger' || card.catalog.type === 'intercept'
    );

    switch (selfLevel) {
      case 1:
      case 2:
        await System.show(
          stack,
          'オーバーチュア',
          'トリガーカード・インターセプトカードのレベル+1'
        );
        handCards.forEach(card => {
          card.lv = Math.min(card.lv + 1, 3);
        });
        break;

      case 3:
        await System.show(
          stack,
          'オーバーチュア',
          'トリガーカード・インターセプトカードのレベル+2'
        );
        handCards.forEach(card => {
          card.lv = Math.min(card.lv + 2, 3);
        });
        break;
    }
  },
};
