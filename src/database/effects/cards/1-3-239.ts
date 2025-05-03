// FIXME: 第2効果を実装する

import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: async (stack: StackWithCard): Promise<boolean> => {
    return stack.processing.owner.id === stack.source.id;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(
      stack,
      '強欲の代償',
      'カードを2枚引く\nジョーカーゲージを0にする\n2ライフダメージ'
    );
    const player = stack.processing.owner;
    [...Array(2)].forEach(() => EffectTemplate.draw(player, stack.core));
  },
};
