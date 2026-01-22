import type { Player } from '@/package/core/class/Player';
import { JOKER_GAUGE_AMOUNT, type JokerGuageAmountKey } from '@/submodule/suit/constant/joker';

export function effectModifyJokerGauge(target: Player, value: number | JokerGuageAmountKey) {
  if (typeof value === 'number') {
    target.joker.gauge += value;
  } else {
    target.joker.gauge -= JOKER_GAUGE_AMOUNT[value];
  }

  if (target.joker.gauge > 100) target.joker.gauge = 100;
  if (target.joker.gauge < 0) target.joker.gauge = 0;

  // inHand設定
  target.checkAndMoveJokerToHand();
}
