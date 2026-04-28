import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import { EffectTemplate } from '@/game-data/effects/engine/templates';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const beastFilter = (unit: Unit) =>
      unit.owner.id !== stack.processing.owner.id && unit.catalog.species?.includes('獣');
    if (!EffectHelper.isUnitSelectable(stack.core, beastFilter, stack.processing.owner)) return;

    await System.show(stack, '黄金の拳', '【獣】を1体破壊\nカードを1枚引く');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      beastFilter,
      '破壊する【獣】を選択'
    );
    Effect.break(stack, stack.processing, target);
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
