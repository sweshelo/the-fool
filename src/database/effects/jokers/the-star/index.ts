import { effects as Starlight } from './starlight';
import { effects as RiseAndShine } from './rise-and-shine';
import { effects as StarImpact } from './star-impact';

export const JokerName = {
  Starlight: 'スターライト',
  RiseAndShine: 'ライズアンドシャイン',
  StarImpact: 'スターインパクト',
};

export const Star = {
  [JokerName.Starlight]: Starlight,
  [JokerName.RiseAndShine]: RiseAndShine,
  [JokerName.StarImpact]: StarImpact,
};
