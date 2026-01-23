import { Evolve } from '@/package/core/class/card';

export function helperIsEvolve(card: unknown): card is Evolve {
  return card instanceof Evolve;
}
