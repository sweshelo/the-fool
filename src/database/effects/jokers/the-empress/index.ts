import { effects as InsightStrife } from './insight-strife';
import { effects as SharplySlive } from './sharply-slive';
import { effects as CheckmateAct } from './checkmate-act';

export const JokerName = {
  InsightStrife: 'インサイトストライフ',
  SharplySlive: 'シャープリィスライヴ',
  CheckmateAct: 'チェックメイトアクト',
};

export const Empress = {
  [JokerName.InsightStrife]: InsightStrife,
  [JokerName.SharplySlive]: SharplySlive,
  [JokerName.CheckmateAct]: CheckmateAct,
};
