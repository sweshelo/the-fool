import type { Delta, DeltaSource } from '@/package/core/class/delta';

export interface KeywordOptionParams {
  event?: string;
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
