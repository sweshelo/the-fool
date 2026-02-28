import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

const getAngelFilter = (self: Unit) => (unit: Unit) =>
  (unit.owner.id === self.owner.id && unit.catalog.species?.includes('天使')) || false;

export const effects: CardEffects = {
  isBootable: (core, self) => {
    return EffectHelper.isUnitSelectable(core, getAngelFilter(self), self.owner);
  },
  onBootSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(
      stack,
      '起動・アフタヌーンブレイカー',
      '【天使】の基本BP+2000\n【強制防御】を付与'
    );
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      getAngelFilter(stack.processing),
      '基本BPを+2000し【強制防御】を付与するユニットを選択'
    );
    Effect.keyword(stack, stack.processing, target, '強制防御');
    Effect.modifyBP(stack, stack.processing, target, 2000, { isBaseBP: true });
  },
};
