import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkTurnStart: (stack: StackWithCard) => {
    return stack.processing.owner.id === stack.source.id;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    switch (stack.processing.lv) {
      case 1: {
        await System.show(stack, 'ビッグドリーム', 'カードを1枚引く');
        EffectTemplate.draw(stack.processing.owner, stack.core);
        break;
      }
      case 2: {
        await System.show(stack, 'ビッグドリーム', 'カードを2枚引く');
        [...Array(2)].forEach(() => EffectTemplate.draw(stack.processing.owner, stack.core));
        break;
      }
      case 3: {
        await System.show(stack, 'ビッグドリーム', 'カードを3枚引く');
        [...Array(3)].forEach(() => EffectTemplate.draw(stack.processing.owner, stack.core));
        break;
      }
    }
  },
};
