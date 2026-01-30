import type { Unit } from '@/package/core/class/card';

export type UnitPickFilter = ((unit: Unit) => unknown) | 'owns' | 'opponents' | 'all';

export interface Choice {
  id: string;
  description: string;
  condition?: boolean;
}
