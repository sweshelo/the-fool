import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 【固着】キーワード能力付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '固着', '手札に戻らない');
    Effect.keyword(stack, stack.processing, stack.processing, '固着');
  },

  // クロック・アップ：ターン開始時にレベル+1
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターン開始時
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      await System.show(stack, 'クロック・アップ', 'レベル+1');
      Effect.clock(stack, stack.processing, stack.processing, 1);
    }
  },

  // 天地鳴動：レベル3にクロックアップした時
  onClockupSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // フィールドにいて、レベル3になったかチェック
    if (stack.processing.lv === 3) {
      await System.show(stack, '天地鳴動', '全ユニットに10000ダメージ');

      // 全てのユニットに10000ダメージを与える
      stack.core.players
        .flatMap(player => player.field)
        .forEach(unit => Effect.damage(stack, stack.processing, unit, 10000, 'effect'));
    }
  },
};
