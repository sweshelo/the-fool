import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

const effect = async (stack: StackWithCard<Unit>): Promise<void> => {
  const samuraiCount = stack.processing.owner.field.filter(unit =>
    unit.catalog.species?.includes('侍')
  ).length;

  const targets = EffectHelper.candidate(
    stack.core,
    unit => unit.owner.id === stack.processing.owner.opponent.id,
    stack.processing.owner
  );

  if (targets.length > 0) {
    const bpReduction = samuraiCount * 2000;
    await System.show(stack, '無心の抜刀術', '基本BP-[【侍】×2000]');

    const [target] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      targets,
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
