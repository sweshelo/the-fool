import type { Player } from '@/package/core/class/Player';

export function helperIsVirusInjectable(player: Player) {
  return player.field.filter(unit => !unit.catalog.species?.includes('ウィルス')).length < 5;
}
