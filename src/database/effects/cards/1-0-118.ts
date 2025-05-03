import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard): boolean => {
    return stack.source.id === stack.processing.owner.id;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '意気投合', 'お互いにカードを2枚引く');
    stack.core.players.forEach(player => {
      [...Array(2)].forEach(() => EffectTemplate.draw(player, stack.core));
    });
  },
};
