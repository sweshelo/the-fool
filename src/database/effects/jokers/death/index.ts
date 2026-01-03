import { effects as Impalement } from './impalement';
import { effects as PunishmentBreak } from './punishment-break';
import { effects as SplendidSickle } from './splendid-sickle';

export const JokerName = {
  Impalement: 'インペイルメント',
  PunishmentBreak: 'パニッシュメントブレイク',
  SplendidSickle: 'スプレンドシックル',
};

export const Death = {
  [JokerName.Impalement]: Impalement,
  [JokerName.PunishmentBreak]: PunishmentBreak,
  [JokerName.SplendidSickle]: SplendidSickle,
};
