import type { Unit } from '@/package/core/class/card';
import type { Player } from '@/package/core/class/Player';
import type { Core } from '@/package/core';
import type { UnitPickFilter } from './types';

export function helperIsUnitSelectable(
  core: Core,
  filter: UnitPickFilter,
  selector: Player,
  count: number = 1
): boolean {
  const exceptBlessing = (unit: Unit) => !unit.hasKeyword('加護');

  const getFilterMethod = () => {
    switch (filter) {
      case 'owns':
        return (unit: Unit) => unit.owner.id === selector.id && !unit.destination;
      case 'opponents':
        return (unit: Unit) => unit.owner.id !== selector.id && !unit.destination;
      case 'all':
        return (unit: Unit) => !unit.destination;
    }
    return filter;
  };

  const candidate = core.players
    .map(p => p.field)
    .flat()
    .filter(exceptBlessing)
    .filter(getFilterMethod());

  return candidate.length >= count;
}
