import type { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.opponent.field.length === 0) return;

    await System.show(stack, 'ウィークバルーン', '【オーバーヒート】を与える\n500ダメージ');
    stack.processing.owner.opponent.field.forEach(unit => {
      Effect.keyword(stack, stack.processing, unit, 'オーバーヒート');
      Effect.damage(stack, stack.processing, unit, 500, 'effect');
    });
  },

  onBreakSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'おにさんこちら！', 'トリガーゾーンにセット');
    Effect.bounce(stack, stack.processing, stack.processing as Unit, 'trigger');
  },
};
