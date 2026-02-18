import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkTurnStart: (stack: StackWithCard) => {
    return stack.processing.owner.trash.length >= 15;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '文明崩壊', 'お互いのデッキと捨札を消滅させる\nカードを1枚引く');
    stack.core.players.forEach(player => {
      [...player.deck, ...player.trash].forEach(card =>
        Effect.move(stack, stack.processing, card, 'delete')
      );
      EffectTemplate.draw(player, stack.core);
    });
  },
};
