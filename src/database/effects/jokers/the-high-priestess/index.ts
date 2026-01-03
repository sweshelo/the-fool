import { effects as SoulExecution } from './soul-execution';
import { effects as ForceLiberation } from './force-liberation';
import { effects as AbyssImitation } from './abyss-imitation';

export const JokerName = {
  SoulExecution: 'ソウルエクスキューション',
  ForceLiberation: 'フォースリべレーション',
  AbyssImitation: 'アビスイミテーション',
};

export const HighPriestess = {
  [JokerName.SoulExecution]: SoulExecution,
  [JokerName.ForceLiberation]: ForceLiberation,
  [JokerName.AbyssImitation]: AbyssImitation,
};
