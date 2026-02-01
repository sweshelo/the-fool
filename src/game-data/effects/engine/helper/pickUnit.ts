import type { Unit } from '@/package/core/class/card';
import type { Player } from '@/package/core/class/Player';
import type { Stack } from '@/package/core/class/stack';
import { System } from '../system';
import type { UnitPickFilter } from './types';

export async function helperPickUnit(
  stack: Stack,
  player: Player,
  filter: UnitPickFilter,
  title: string,
  count: number = 1
): Promise<[Unit, ...Unit[]]> {
  const selected: Unit[] = [];

  const getFilterMethod = () => {
    switch (filter) {
      case 'owns':
        return (unit: Unit) => unit.owner.id === player.id;
      case 'opponents':
        return (unit: Unit) => unit.owner.id !== player.id;
      case 'all':
        return () => true;
    }
    return filter;
  };

  while (selected.length < count) {
    const candidate: Unit[] = stack.core.players
      .flatMap(player => player.field)
      .filter(unit => !selected.includes(unit) && !unit.hasKeyword('加護'))
      .filter(getFilterMethod());
    if (candidate.length <= 0) break;

    const selectHacked: Unit[] = candidate.filter(
      unit => unit.owner.id !== player.id && unit.hasKeyword('セレクトハック')
    );

    const [choiceId] = await System.prompt(stack, player.id, {
      title,
      type: 'unit',
      items: selectHacked.length > 0 ? selectHacked : candidate,
    });

    const chosen = candidate.find(unit => unit.id === choiceId) ?? candidate[0];
    if (!chosen) throw new Error('対象のユニットが存在しません');

    stack.core.room.visualEffect({
      effect: 'select',
      unitId: chosen.id,
    });

    selected.push(chosen);
  }

  // oxlint-disable-next-line no-unsafe-type-assertion
  if (selected.length > 0) return selected as [Unit, ...Unit[]];
  throw new Error('選択すべきユニットが見つかりませんでした');
}
