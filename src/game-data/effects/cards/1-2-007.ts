import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  //■ダークソウル
  //このユニットがアタックした時、このユニットの基本BPを+［あなたの捨札の数×500］する。

  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;

    await System.show(stack, 'ダークソウル', '基本BP+捨札の数×500');

    Effect.modifyBP(stack, self, self, self.owner.trash.length * 500, { isBaseBP: true });
  },
};
