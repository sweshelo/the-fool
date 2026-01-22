import type { Stack } from '@/package/core/class/stack';
import type { Card, Unit } from '@/package/core/class/card';
import { Evolve } from '@/package/core/class/card';
import { Delta } from '@/package/core/class/delta';
import { createMessage } from '@/submodule/suit/types';
import { effectKeyword } from './keyword';

export async function effectSummon(
  stack: Stack,
  source: Card,
  target: Unit,
  isCopy?: boolean
): Promise<Unit | undefined> {
  const hasFieldSpace = target.owner.field.length < stack.core.room.rule.player.max.field;
  const isNotEvolve = !(target instanceof Evolve);

  if (hasFieldSpace && isNotEvolve) {
    const exist = target.owner.find(target);
    if (exist.result && exist.place && exist.place?.name !== 'field') {
      target.owner[exist.place.name] = target.owner[exist.place.name].filter(
        c => c.id !== target.id
      );
    }

    target.owner.field.push(target);

    if (!isCopy) {
      target.initBP();
      target.active = true;
    }
    stack.core.room.soundEffect(isCopy ? 'copied' : 'drive');

    stack.core.room.broadcastToAll(
      createMessage({
        action: {
          type: 'effect',
          handler: 'client',
        },
        payload: {
          type: 'VisualEffect',
          body: {
            effect: 'drive',
            image: `https://coj.sega.jp/player/img/${target.catalog.img}`,
            player: target.owner.id,
            type: 'UNIT',
          },
        },
      })
    );

    effectKeyword(stack, target, target, '行動制限');

    if (typeof target.catalog.onBootSelf === 'function')
      target.delta.unshift(new Delta({ type: 'keyword', name: '起動' }));

    stack.addChildStack('extraSummon', source, target);
    stack.core.room.sync();

    return new Promise(resolve => setTimeout(() => resolve(target), 1200));
  }
}
