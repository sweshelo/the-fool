import type { Card } from '@/package/core/class/card';
import { Effect } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';

export const effects: CardEffects = {
  // トリガー: 対戦相手のターン開始時、対戦相手よりあなたのライフが少ない場合
  checkTurnStart: (stack: StackWithCard<Card>): boolean => {
    return (
      stack.source.id === stack.processing.owner.opponent.id &&
      stack.processing.owner.life.current < stack.processing.owner.opponent.life.current
    );
  },

  onTurnStart: async (stack: StackWithCard<Card>): Promise<void> => {
    await System.show(stack, '星の願い', '全てのユニットに【攻撃禁止】');

    // 全てのユニットに【攻撃禁止】を与える
    const allUnits = stack.core.players.flatMap(p => p.field);
    for (const unit of allUnits) {
      Effect.keyword(stack, stack.processing, unit, '攻撃禁止', {
        event: 'turnEnd',
        count: 1,
      });
    }
  },
};
