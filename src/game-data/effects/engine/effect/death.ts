import type { Unit } from '@/package/core/class/card';
import { Delta } from '@/package/core/class/delta';

export function effectDeath(target: Unit, count: number) {
  const deathCounter = target.delta.find(delta => delta.effect.type === 'death');
  if (deathCounter) {
    deathCounter.count = count;
  } else {
    target.delta.push(
      new Delta({ type: 'death' }, { event: 'turnEnd', count, onlyForOwnersTurn: true })
    );
  }
}
