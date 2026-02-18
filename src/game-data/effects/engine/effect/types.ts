import type { Delta, DeltaSource } from '@/package/core/class/delta';
import type { GameEvent } from '../../schema/events';

export interface KeywordOptionParams {
  event?: GameEvent;
  count?: number;
  cost?: number;
  onlyForOwnersTurn?: boolean;
  source?: DeltaSource;
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
