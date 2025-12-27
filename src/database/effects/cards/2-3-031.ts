import { System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    return (
      stack.processing.owner.id === stack.source.id && stack.processing.owner.trigger.length >= 2
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    switch (stack.processing.lv) {
      case 1:
      case 2: {
        await System.show(stack, '彩光の羽ばたき', 'トリガーゾーンのレベル+1');
        stack.processing.owner.trigger.forEach(card => (card.lv = Math.min(card.lv + 1, 3)));
        break;
      }
      case 3: {
        await System.show(stack, '彩光の羽ばたき', 'トリガーゾーンのレベル+2');
        stack.processing.owner.trigger.forEach(card => (card.lv = Math.min(card.lv + 2, 3)));
        break;
      }
    }
  },
};
