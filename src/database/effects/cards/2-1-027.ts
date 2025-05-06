import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    return stack.processing.owner.id === stack.source.id && stack.processing.owner.hand.length > 0;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'ダウジング', '手札を1枚破壊\nカードを2枚引く');
    EffectHelper.random(stack.processing.owner.hand).forEach(card =>
      Effect.handes(stack, stack.processing, card)
    );
    [...Array(2)].forEach(() => EffectTemplate.draw(stack.processing.owner, stack.core));
  },
};
