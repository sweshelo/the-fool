import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■バーニングバースト
  // このユニットが破壊された時、対戦相手の全てのユニットに1000ダメージを与え、捨札に送られる代わりにあなたの手札に戻る。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(stack, 'バーニングバースト', '敵全体に1000ダメージ\n手札に戻る');

    // 対戦相手の全てのユニットに1000ダメージ
    opponent.field.forEach(unit => {
      Effect.damage(stack, stack.processing, unit, 1000);
    });

    // 捨札に送られる代わりに手札に戻る
    Effect.move(stack, stack.processing, stack.processing, 'hand');
  },
};
