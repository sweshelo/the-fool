import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: async (stack: StackWithCard): Promise<boolean> => {
    return (
      EffectHelper.owner(stack.core, stack.source).id ===
      EffectHelper.owner(stack.core, stack.processing).id
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'サプライズボックス', 'トリガーカードを2枚引く');
    const owner = EffectHelper.owner(stack.core, stack.processing);
    const targets = owner.deck.filter(card => card.catalog().type === 'trigger').slice(0, 2);

    targets.forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
  },
};
