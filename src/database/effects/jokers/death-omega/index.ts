import { effects as GraffitiEarth } from './graffiti-earth';

export const JokerName = {
  MirageAurora: 'ミラージュ・アウローラ',
  SpreadInferno: 'スプレッド・インフェルノ',
  GraffitiEarth: 'グラフィティ・アース',
  RegenerateDeluge: 'リジェネレート・デリュージ',
  AbsoluteArc: 'アブソリュート・アーク',
};

export const DeathOmega = {
  [JokerName.MirageAurora]: undefined,
  [JokerName.SpreadInferno]: undefined,
  [JokerName.GraffitiEarth]: GraffitiEarth,
  [JokerName.RegenerateDeluge]: undefined,
  [JokerName.AbsoluteArc]: undefined,
};
