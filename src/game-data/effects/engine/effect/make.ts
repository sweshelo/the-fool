import type { Stack } from '@/package/core/class/stack';
import type { Card } from '@/package/core/class/card';
import { Unit, Evolve, Intercept, Trigger } from '@/package/core/class/card';
import type { Player } from '@/package/core/class/Player';
import master from '@/game-data/catalog';

export function effectMake(
  stack: Stack,
  player: Player,
  target: Card | string,
  locationKey: 'hand' | 'trigger' = 'hand'
) {
  const location = player[locationKey];
  if (location.length >= stack.core.room.rule.player.max[locationKey]) return;
  switch (locationKey) {
    case 'hand': {
      stack.core.room.soundEffect('draw');
      break;
    }
    case 'trigger': {
      stack.core.room.soundEffect('trigger');
      break;
    }
  }

  if (typeof target === 'string') {
    const catalog = master.get(target);
    if (catalog) {
      switch (catalog.type) {
        case 'unit': {
          const card = new Unit(player, catalog.id);
          location.push(card);
          return card;
        }
        case 'advanced_unit': {
          const card = new Evolve(player, catalog.id);
          location.push(card);
          return card;
        }
        case 'intercept': {
          const card = new Intercept(player, catalog.id);
          location.push(card);
          return card;
        }
        case 'trigger': {
          const card = new Trigger(player, catalog.id);
          location.push(card);
          return card;
        }
      }
    }
  } else {
    const clone = target.clone(player);

    if (stack.core.players.flatMap(player => player.field).some(unit => unit.id === target.id)) {
      clone.reset();
    }

    location.push(clone);
    return clone;
  }
}
