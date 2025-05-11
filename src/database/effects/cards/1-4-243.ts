import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkBattle: (stack: StackWithCard) => {
    return stack.source instanceof Unit &&
      stack.target instanceof Unit &&
      stack.source.owner.field.find(unit => unit.id === stack.source.id) &&
      stack.target.owner.field.find(unit => unit.id === stack.target?.id)
      ? true
      : false;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onBattle: async (stack: StackWithCard): Promise<void> => {
    if (stack.source instanceof Unit && stack.target instanceof Unit) {
      await System.show(
        stack,
        'どきどきテイスティング',
        '捨札を全て消滅\nデッキから5枚まで捨てる\nBP+[捨札のユニット×1000]'
      );
      const ownUnit =
        stack.source.owner.id === stack.processing.owner.id ? stack.source : stack.target;
      stack.processing.owner.trash.forEach(card =>
        Effect.move(stack, stack.processing, card, 'delete')
      );
      EffectHelper.random(stack.processing.owner.deck, 5).forEach(card =>
        Effect.move(stack, stack.processing, card, 'trash')
      );
      Effect.modifyBP(
        stack,
        stack.processing,
        ownUnit,
        stack.processing.owner.trash.filter(card => card instanceof Unit).length * 1000,
        { event: 'turnEnd', count: 1 }
      );
    }
  },
};
