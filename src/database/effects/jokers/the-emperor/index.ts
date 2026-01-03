import { effects as DeleteRaid } from './delete-raid';
import { effects as HereticScar } from './heretic-scar';
import { effects as ImperialCrusade } from './imperial-crusade';

export const JokerName = {
  DeleteRaid: 'デリートレイド',
  HereticScar: 'ヘレティックスカー',
  ImperialCrusade: 'インペリアルクルセイド',
};

export const Emperor = {
  [JokerName.DeleteRaid]: DeleteRaid,
  [JokerName.HereticScar]: HereticScar,
  [JokerName.ImperialCrusade]: ImperialCrusade,
};
