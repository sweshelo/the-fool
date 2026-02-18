import { Unit } from '@/package/core/class/card';

export function helperIsUnit(card: unknown, strict: boolean = false): card is Unit {
  return card instanceof Unit && (strict ? card.catalog.type === 'unit' : true);
}
