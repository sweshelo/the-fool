import type { Delta, DeltaCondition, DeltaSource } from '@/package/core/class/delta';
import type { GameEvent } from '../../schema/events';

export interface KeywordOptionParams {
  event?: GameEvent;
  count?: number;
  cost?: number;
  onlyForOwnersTurn?: boolean;
  source?: DeltaSource;
  /**
   * 次元干渉の特殊条件関数
   * @param self アタッカー
   * @param blocker ブロッカーの候補
   * @returns falseでブロック可能、trueでブロック不可能
   */
  condition?: DeltaCondition;
}

export type ModifyBPOption =
  | {
      isBaseBP: true;
    }
  | {
      event: Delta['event'];
      count: Delta['count'];
    }
  | {
      source: Delta['source'];
    };
