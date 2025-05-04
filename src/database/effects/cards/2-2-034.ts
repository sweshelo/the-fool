import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard): boolean => {
    return (
      stack.processing.owner.id === stack.source.id &&
      Array.from(
        new Set(stack.core.players.flatMap(player => player.field).map(card => card.catalog.color))
      ).length === 5
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'みんななかよし！', 'お互いにカードを7枚引く\nCP-12');
    stack.core.players.forEach(player => {
      [...Array(7)].forEach(() => EffectTemplate.draw(player, stack.core));
      Effect.modifyCP(stack, stack.processing, player, -12);
    });
  },
};
