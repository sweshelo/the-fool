import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    return (
      stack.processing.owner.id === stack.source.id &&
      stack.target instanceof Unit &&
      stack.target.catalog.cost >= 6 &&
      stack.processing.owner.opponent.trigger.length > 0
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '大翼の暴風', 'トリガーゾーンを2枚までデッキに戻す');
    EffectHelper.random(stack.processing.owner.opponent.trigger, 2).forEach(card =>
      Effect.move(stack, stack.processing, card, 'deck')
    );
  },
};
