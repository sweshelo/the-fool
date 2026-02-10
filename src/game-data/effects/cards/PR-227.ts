import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    return stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'テトラクトュス', 'コスト7以上のユニットを2枚引く');
    EffectHelper.random(
      stack.processing.owner.deck.filter(card => card instanceof Unit && card.catalog.cost >= 7),
      2
    ).forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
  },
};
