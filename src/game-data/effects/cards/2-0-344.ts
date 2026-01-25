import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■灼熱の大地
  // ユニットがフィールドに出た時、全てのユニットに［フィールドに出たユニットのコスト×1000］ダメージを与える。
  checkDrive: (stack: StackWithCard): boolean => {
    // ユニットが出た時に発動
    return stack.target instanceof Unit;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.target instanceof Unit)) return;

    const cost = stack.target.catalog.cost;
    const damage = cost * 1000;

    await System.show(stack, '灼熱の大地', '全ユニットに[コスト×1000]ダメージ');

    // 全てのユニットにダメージを与える
    stack.core.players.forEach(player => {
      player.field.forEach(unit => {
        Effect.damage(stack, stack.processing, unit, damage);
      });
    });
  },
};
