import type { Stack } from '@/package/core/class/stack';
import type { Card } from '@/package/core/class/card';
import type { Player } from '@/package/core/class/Player';

export function effectModifyLife(stack: Stack, source: Card, player: Player, value: number) {
  if (value === 0) return;

  if (value < 0) {
    const isSuicideDamage = source.owner.id === player.id;
    const damageCount = Math.abs(value);
    for (let i = 0; i < damageCount; i++) {
      player.damage(isSuicideDamage);
    }
    stack.core.room.soundEffect('damage');
  } else {
    player.life.current = Math.min(value + player.life.current, player.life.max);
    stack.core.room.soundEffect('recover');
  }
}
