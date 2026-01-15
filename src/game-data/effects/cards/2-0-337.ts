import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard): boolean => {
    return (
      stack.processing.owner.id === stack.source.id && stack.processing.owner.trash.length >= 20
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '掘り出し物', '捨札から1枚選んで回収\n捨札をデッキに戻す');
    const player = stack.processing.owner;
    await EffectTemplate.revive(stack, 1);
    player.deck = [...player.deck, ...player.trash];
    player.trash = [];
  },
};
