import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

const effect = async (stack: StackWithCard<Unit>): Promise<void> => {
  const samuraiCount = stack.processing.owner.field.filter(unit =>
    unit.catalog.species?.includes('侍')
  ).length;

  const targetsFilter = (unit: Unit) => unit.owner.id === stack.processing.owner.opponent.id;
  const targets_selectable = EffectHelper.isUnitSelectable(
    stack.core,
    targetsFilter,
    stack.processing.owner
  );

  if (targets_selectable) {
    const bpReduction = samuraiCount * 2000;
    await System.show(stack, '無心の抜刀術', '基本BP-[【侍】×2000]');

    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      targetsFilter,
      '基本BPを下げるユニットを選択'
    );

    Effect.modifyBP(stack, stack.processing, target, -bpReduction, { isBaseBP: true });
  }
};

export const effects: CardEffects = {
  // ユニット: 無心の抜刀術 - フィールドに出た時
  onDriveSelf: effect,
  // ユニット: 無心の抜刀術 - 破壊された時
  onBreakSelf: effect,
};
