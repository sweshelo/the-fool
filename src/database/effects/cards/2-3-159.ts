import { Unit } from '@/package/core/class/card';
import type { Card } from '@/package/core/class/card/Card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard<Card>): boolean => {
    // 自分のユニットが召喚され、かつ捨札にインターセプトカードが5枚以上ある場合のみ発動
    const isOwnUnit =
      stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id;
    const interceptCount = stack.processing.owner.trash.filter(
      card => card.catalog.type === 'intercept'
    ).length;
    return isOwnUnit && interceptCount >= 5;
  },

  onDrive: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '蘇活の詠唱',
      '捨札をデッキに戻す\nインターセプトカードを1枚引く\nレベル+2'
    );

    // 捨札を全てデッキに戻す
    const trashCards = [...stack.processing.owner.trash];
    trashCards.forEach(card => Effect.move(stack, stack.processing, card, 'deck'));

    // インターセプトカードを1枚引く
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });

    // 引いたカードのレベルを+2（手札の最後に追加されたカード）
    if (stack.processing.owner.hand.length > 0) {
      const drawnCard = stack.processing.owner.hand[stack.processing.owner.hand.length - 1];
      if (drawnCard) {
        drawnCard.lv = Math.min(drawnCard.lv + 2, 3);
      }
    }
  },
};
