import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 【スピードムーブ】キーワード能力の付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'スピードムーブ', '行動制限の影響を受けない');
    Effect.speedMove(stack, stack.processing);
  },

  // 伝説の大盗賊：プレイヤーアタックに成功した時、全てのユニットをオーバークロック
  onPlayerAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '伝説の大盗賊', '全ユニットをオーバークロック');

    // 全てのユニットをオーバークロック（レベル+2）
    stack.core.players.forEach(player => {
      player.field.forEach(unit => {
        Effect.clock(stack, stack.processing, unit, 2);
      });
    });
  },
};
