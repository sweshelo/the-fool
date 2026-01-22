import type { Unit } from '@/package/core/class/card';
import type { Core } from '@/package/core';

export function helperExceptSelf(core: Core, card: Unit, effect: (unit: Unit) => void): void {
  const units = core.players
    .map(p => p.field)
    .flat()
    .filter(u => u.id !== card.id);
  units.forEach(effect);
}
