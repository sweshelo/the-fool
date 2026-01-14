import { effects as MeisatsuSairin } from './meisatsu-sairin';
import { effects as MeitenKyousatsu } from './meiten-kyousatsu';
import { effects as GekkaShinmetsu } from './gekka-shinmetsu';

export const JokerName = {
  MeisatsuSairin: '冥札再臨',
  MeitenKyousatsu: '明天凶殺',
  GekkaShinmetsu: '月花熾滅',
};

export const Moon = {
  [JokerName.MeisatsuSairin]: MeisatsuSairin,
  [JokerName.MeitenKyousatsu]: MeitenKyousatsu,
  [JokerName.GekkaShinmetsu]: GekkaShinmetsu,
};
