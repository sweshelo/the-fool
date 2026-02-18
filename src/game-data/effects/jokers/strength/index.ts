import { effects as RanshouHoushuuNoMai } from './ranshou-houshuu-no-mai';
import { effects as HiryuuJouunNoKen } from './hiryuu-jouun-no-ken';
import { effects as IkiShoutenNoRou } from './iki-shouten-no-rou';

export const JokerName = {
  RanshouHoushuuNoMai: '蘭翔鳳集の舞',
  HiryuuJouunNoKen: '飛龍乗雲の拳',
  IkiShoutenNoRou: '威気衝天の籠',
};

export const Strength = {
  [JokerName.RanshouHoushuuNoMai]: RanshouHoushuuNoMai,
  [JokerName.HiryuuJouunNoKen]: HiryuuJouunNoKen,
  [JokerName.IkiShoutenNoRou]: IkiShoutenNoRou,
};
