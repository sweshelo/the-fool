import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■地母神の降臨
  // このユニット以外の全てのユニットに7000ダメージを与える。
  async onDriveSelf(stack: StackWithCard<Unit>) {
    // 全てのユニットを取得
    const allUnits = stack.core.players
      .map(p => p.field)
      .flat()
      .filter(unit => unit.id !== stack.processing.id);

    if (allUnits.length > 0) {
      await System.show(stack, '地母神の降臨', '全ユニットに7000ダメージ');

      // 自身以外に7000ダメージを与える
      for (const unit of allUnits) {
        if (unit.id !== stack.processing.id) {
          Effect.damage(stack, stack.processing, unit, 7000);
        }
      }
    }
  },

  // ■母なる揺り籠
  // あなたのターン開始時、全てのユニットに3000ダメージを与える。
  async onTurnStartSelf(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;
    const turnPlayer = stack.core.getTurnPlayer();

    // 自分のターン開始時のみ発動
    if (owner.id === turnPlayer.id) {
      await System.show(stack, '母なる揺り籠', '全ユニットに3000ダメージ');

      // 全てのユニットを取得
      const allUnits = stack.core.players.map(p => p.field).flat();

      // 全てのユニットに3000ダメージを与える
      for (const unit of allUnits) {
        Effect.damage(stack, stack.processing, unit, 3000);
      }
    }
  },

  // ■生命の淘汰
  // このユニットが破壊された時、全てのユニットに5000ダメージを与える。
  async onBreakSelf(stack: StackWithCard<Unit>) {
    await System.show(stack, '生命の淘汰', '全ユニットに5000ダメージ');

    // 全てのユニットを取得
    const allUnits = stack.core.players.map(p => p.field).flat();

    // 全てのユニットに5000ダメージを与える
    for (const unit of allUnits) {
      Effect.damage(stack, stack.processing, unit, 5000);
    }
  },
};
