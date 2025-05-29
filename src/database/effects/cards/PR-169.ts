import type { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.processing.owner.opponent.field.length > 0) {
      await System.show(stack, 'ブラッド・ローズ・ガーデン', '基本BP1/2\n【貫通】');
      stack.processing.owner.opponent.field.forEach(unit =>
        Effect.modifyBP(stack, stack.processing, unit, -unit.bp / 2, { isBaseBP: true })
      );
    } else {
      await System.show(stack, '貫通', 'ブロックを貫通してダメージを与える');
    }
    Effect.keyword(stack, stack.processing, stack.processing, '貫通');
  },

  onAttackSelf: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.opponent.field.length > 0) {
      await System.show(stack, 'カレス・オブ・ローズマリア', '基本BP-1000');
      stack.processing.owner.opponent.field.forEach(unit =>
        Effect.modifyBP(stack, stack.processing, unit, -1000, { isBaseBP: true })
      );
    }
  },
};
