import type { Player } from '@/package/core/class/Player';

export function helperHasGauge(player: Player, gaugeKey: '小' | '中' | '大' | '特大'): boolean {
  switch (gaugeKey) {
    case '小':
      return player.joker.gauge > 40;
    case '中':
      return player.joker.gauge > 52.5;
    case '大':
      return player.joker.gauge > 65;
    case '特大':
      return player.joker.gauge > 80;
  }
}
