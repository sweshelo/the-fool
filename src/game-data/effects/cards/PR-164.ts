import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkTurnStart: (stack: StackWithCard): boolean => {
    return stack.source.id !== stack.processing.owner.id;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '銀の神殿', 'トリガーかインターセプトを2枚引く');
    [...Array(2)].forEach(() =>
      EffectTemplate.reinforcements(stack, stack.processing.owner, {
        type: ['intercept', 'trigger'],
      })
    );
    [...Array(2)].forEach(() =>
      EffectTemplate.reinforcements(stack, stack.processing.owner.opponent, {
        type: ['intercept', 'trigger'],
      })
    );
  },
};
