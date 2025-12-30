import type { Card } from '@/package/core/class/card';
import { Unit } from '@/package/core/class/card';
import { Effect } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  // トリガー: あなたの【忍者】ユニットがアタックした時
  checkAttack: (stack: StackWithCard<Card>): boolean => {
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      (stack.target.catalog.species?.includes('忍者') ?? false)
    );
  },

  onAttack: async (stack: StackWithCard<Card>): Promise<void> => {
    if (!(stack.target instanceof Unit)) return;

    await System.show(stack, '密偵', 'ブロックされない');
    // 「ブロックされない」= 次元干渉をコスト0で付与
    Effect.keyword(stack, stack.processing, stack.target, '次元干渉', {
      cost: 0,
      event: 'turnEnd',
      count: 1,
    });
  },
};
