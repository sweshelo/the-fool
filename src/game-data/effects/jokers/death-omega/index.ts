import { effects as MirageAurora } from './mirage-aurora';
import { effects as SpreadInferno } from './spread-inferno';
import { effects as GraffitiEarth } from './graffiti-earth';
import { effects as RegenerateDeluge } from './regenerate-deluge';
import { effects as AbsoluteArc } from './absolute-arc';

export const JokerName = {
  MirageAurora: 'ミラージュ・アウローラ',
  SpreadInferno: 'スプレッド・インフェルノ',
  GraffitiEarth: 'グラフィティ・アース',
  RegenerateDeluge: 'リジェネレート・デリュージ',
  AbsoluteArc: 'アブソリュート・アーク',
};

export const DeathOmega = {
  [JokerName.MirageAurora]: MirageAurora,
  [JokerName.SpreadInferno]: SpreadInferno,
  [JokerName.GraffitiEarth]: GraffitiEarth,
  [JokerName.RegenerateDeluge]: RegenerateDeluge,
  [JokerName.AbsoluteArc]: AbsoluteArc,
};
