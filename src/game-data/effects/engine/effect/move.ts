import type { Stack } from '@/package/core/class/stack';
import type { Card } from '@/package/core/class/card';
import type { CardArrayKeys } from '@/package/core/class/Player';

export function effectMove(
  stack: Stack,
  source: Card,
  target: Card,
  location: CardArrayKeys
): void {
  const owner = target.owner;
  const cardFind = owner.find(target);

  if (!cardFind.result || !cardFind.place) {
    throw new Error('対象が見つかりませんでした');
  }

  const origin = cardFind.place.name;

  if (!['hand', 'trigger', 'deck', 'trash', 'field', 'delete'].includes(origin)) {
    throw new Error(`無効な移動元です: ${origin}`);
  }

  if (!(location in owner) || location === cardFind.place.name) {
    throw new Error(`無効な移動先です: ${location}`);
  }

  if (location === 'hand' && owner.hand.length >= stack.core.room.rule.player.max.hand) return;
  if (location === 'trigger' && owner.trigger.length >= stack.core.room.rule.player.max.trigger)
    return;

  switch (origin) {
    case 'hand':
      owner.hand = owner.hand.filter(c => c.id !== target.id);
      break;
    case 'trigger':
      owner.trigger = owner.trigger.filter(c => c.id !== target.id);
      break;
    case 'trash':
      owner.trash = owner.trash.filter(c => c.id !== target.id);
      break;
    case 'field':
      owner.field = owner.field.filter(c => c.id !== target.id);
      break;
    case 'deck':
      owner.deck = owner.deck.filter(c => c.id !== target.id);
      break;
    case 'delete':
      owner.delete = owner.delete.filter(c => c.id !== target.id);
      break;
  }

  const controllableArea = ['field', 'hand', 'trigger'];
  target.reset(controllableArea.includes(origin) && !controllableArea.includes(location));

  switch (location) {
    case 'hand':
      owner.hand.push(target);
      stack.core.room.soundEffect('draw');
      break;
    case 'trigger':
      owner.trigger.push(target);
      stack.core.room.soundEffect('trigger');
      break;
    case 'deck':
      owner.deck.push(target);
      break;
    case 'trash':
      if (origin === 'hand') stack.core.room.soundEffect('destruction');
      owner.trash.push(target);
      break;
    case 'delete':
      if (origin === 'hand') stack.core.room.soundEffect('destruction');
      owner.delete.push(target);
  }

  if (origin === 'trigger' && location === 'trash') {
    stack.core.room.soundEffect('destruction');
    stack.addChildStack('lost', source, target);
  } else {
    stack.addChildStack('move', source, target);
  }
}
