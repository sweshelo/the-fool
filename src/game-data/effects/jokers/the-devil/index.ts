import { effects as GuiltyAsh } from './guilty-ash';
import { effects as VolcanicDisaster } from './volcanic-disaster';
import { effects as CarnivalDominate } from './carnival-dominate';

export const JokerName = {
  GuiltyAsh: 'ギルティアッシュ',
  VolcanicDisaster: 'ボルカニックディザスター',
  CarnivalDominate: 'カーニバルドミネイト',
};

export const Devil = {
  [JokerName.GuiltyAsh]: GuiltyAsh,
  [JokerName.VolcanicDisaster]: VolcanicDisaster,
  [JokerName.CarnivalDominate]: CarnivalDominate,
};
