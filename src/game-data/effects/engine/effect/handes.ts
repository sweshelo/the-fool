import type { Stack } from '@/package/core/class/stack';
import type { Card } from '@/package/core/class/card';

export function effectHandes(stack: Stack, source: Card, target: Card): void {
  const owner = target.owner;
  const card = owner.find(target);

  if (card.place?.name === 'hand') {
    target.lv = 1;
    owner.hand = owner.hand.filter(c => c.id !== target.id);
    owner.trash.push(target);
    stack.core.room.sync();
    stack.core.room.soundEffect('destruction');

    stack.addChildStack('handes', source, target);
  }
}
