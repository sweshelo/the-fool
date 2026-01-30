import type { Core, History } from '@/package/core';
import type { Catalog } from '@/submodule/suit/types';

export interface ComboCheckCondition {
  action?: History['action'];
  type?: Catalog['type'][];
  cost?: number;
  color?: Catalog['color'][];
}

export const GREEN_COMBO = (cost: number): ComboCheckCondition => ({
  action: 'drive',
  type: ['unit', 'advanced_unit', 'intercept'],
  cost,
});

export const helperCombo = (core: Core, condition: ComboCheckCondition) => {
  return core.histories.some(history => {
    (condition.action ? condition.action === history.action : true) &&
      (condition.cost ? condition.cost <= history.card.catalog.cost : true) &&
      (condition.type ? condition.type.includes(history.card.catalog.type) : true) &&
      (condition.color ? condition.color.includes(history.card.catalog.color) : true);
  });
};
