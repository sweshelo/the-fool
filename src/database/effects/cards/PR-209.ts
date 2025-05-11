import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■豪傑王の野心
  // このユニットがフィールドに出た時、このユニットのレベルを+1する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '豪傑王の野心', 'レベル+1');
    Effect.clock(stack, stack.processing, stack.processing, 1, false);
  },

  // ■ウルクの暴君
  // このユニットがオーバークロックした時、このユニット以外の全てのユニットに7000ダメージを与える。そうした場合、あなたは1ライフダメージを受ける。
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 全ユニットのリスト
    const allUnits = [...owner.field, ...opponent.field];

    // このユニット以外の全てのユニット
    const otherUnits = allUnits.filter(unit => unit.id !== stack.processing.id);

    if (otherUnits.length > 0) {
      await System.show(stack, 'ウルクの暴君', '自身以外に7000ダメージ\n1ライフダメージ');

      // 全ユニットに7000ダメージ
      otherUnits.forEach(unit => {
        Effect.damage(stack, stack.processing, unit, 7000);
      });

      // 自分に1ライフダメージ
      owner.damage();
    }
  },
};
