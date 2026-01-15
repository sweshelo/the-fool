import type { Card } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■スピード違反
  // あなたがプレイヤーアタックを受けた時、対戦相手の全てのユニットにターン終了時まで【攻撃禁止】を与える。
  checkPlayerAttack: (stack: StackWithCard<Card>): boolean => {
    // 自分がプレイヤーアタックを受けた場合のみ発動
    return stack.target?.id === stack.processing.owner.id;
  },

  onPlayerAttack: async (stack: StackWithCard<Card>): Promise<void> => {
    // 対戦相手のフィールド上の全てのユニット
    const opponentUnits = stack.processing.owner.opponent.field;

    if (opponentUnits.length > 0) {
      await System.show(stack, 'スピード違反', '【攻撃禁止】を付与');

      // 全てのユニットに【攻撃禁止】を付与
      for (const unit of opponentUnits) {
        Effect.keyword(stack, stack.processing, unit, '攻撃禁止', {
          event: 'turnEnd',
          count: 1,
          source: { unit: stack.processing.id },
        });
      }
    }
  },
};
