import type { Delta, DeltaSource } from '@/package/core/class/delta';
import type { GameEvent } from '../../schema/events';
import type { Unit } from '@/package/core/class/card';

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
  condition?: (self?: Unit, blocker?: Unit) => boolean | unknown;
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
