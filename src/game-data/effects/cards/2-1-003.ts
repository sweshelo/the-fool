import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

async function singenEffect(stack: StackWithCard<Unit>): Promise<void> {
  const owner = stack.processing.owner;

  // あなたのフィールドにこのユニット以外の【侍】ユニットがいる場合、
  const samuraiUnits = owner.field.filter(
    unit => unit.catalog.species?.includes('侍') && unit.id !== stack.processing.id
  );
  if (samuraiUnits.length > 0 && EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) {
    await System.show(stack, '猛火の如く', '6000ダメージ');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      'ダメージを与えるユニットを選択してください'
    );
    Effect.damage(stack, stack.processing, target, 6000);
  }
}

export const effects: CardEffects = {
  onDriveSelf: singenEffect,
  onAttackSelf: singenEffect,
  onBreakSelf: singenEffect,
};
