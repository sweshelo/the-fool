import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

const ability = async (stack: StackWithCard): Promise<void> => {
  const filter = (unit: Unit) =>
    unit.owner.id === stack.processing.owner.id &&
    (unit.catalog.species?.includes('武身') ?? false);
  if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
    await System.show(stack, '鏡盾の守護', '【秩序の盾】を付与');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      '【秩序の盾】を与えるユニットを選択してください'
    );
    Effect.keyword(stack, stack.processing, target, '秩序の盾');
  }
};

export const effects: CardEffects = {
  onDriveSelf: ability,
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    // 対戦相手のターン開始時は、自フィールドに武身が4体以上いる場合に限る
    if (
      stack.processing.owner.id !== stack.core.getTurnPlayer().id &&
      stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('武身')).length < 4
    )
      return;
    await ability(stack);
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    if (
      stack.processing.owner.id === stack.core.getTurnPlayer().id ||
      !(stack.processing instanceof Unit)
    )
      return;
    await EffectTemplate.reincarnate(stack, stack.processing);
  },
};
