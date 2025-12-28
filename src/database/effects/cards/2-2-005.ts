import { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 対戦相手のユニットがフィールドに出た時、それに【オーバーヒート】を与える
  onDrive: async (stack: StackWithCard<Unit>) => {
    if (stack.target instanceof Unit && stack.processing.owner.id !== stack.target.owner.id) {
      Effect.keyword(stack, stack.processing, stack.target, 'オーバーヒート');
      await System.show(stack, '妖魔の呪詛', '【オーバーヒート】を与える');
    }
  },

  // このユニットが破壊された時、全てのユニットに［対戦相手のユニット数×1000］ダメージを与える
  onBreakSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const opponent = self.owner.opponent;
    const damage = opponent.field.length * 1000;

    // 全てのユニットにダメージを与える
    const allUnits = [...self.owner.field, ...opponent.field];
    for (const unit of allUnits) {
      Effect.damage(stack, self, unit, damage);
    }

    await System.show(stack, '煉獄の業火', '［対戦相手のユニット×1000］ダメージ');
  },
};
