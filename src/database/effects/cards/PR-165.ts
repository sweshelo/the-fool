import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    return stack.processing.owner.id === stack.source.id;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const target = stack.target;
    if (target instanceof Unit) {
      await System.show(stack, '金の神殿', '同属性のユニットカードを1枚引く');
      EffectHelper.random(
        stack.processing.owner.deck.filter(
          card => card.catalog.type === 'unit' && card.catalog.color === target.catalog.color
        )
      ).forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
    }
  },
};
