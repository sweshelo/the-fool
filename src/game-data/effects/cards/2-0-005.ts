import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

const ability = async (stack: StackWithCard): Promise<void> => {
  const targetsFilter = (unit: Unit) => unit.owner.id === stack.processing.owner.opponent.id;
  const targets_selectable = EffectHelper.isUnitSelectable(
    stack.core,
    targetsFilter,
    stack.processing.owner
  );

  if (targets_selectable) {
    await System.show(stack, '炎剣の劫火', '3000ダメージ');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      targetsFilter,
      'ダメージを与えるユニットを選択'
    );

    Effect.damage(stack, stack.processing, target, 3000, 'effect');
  }
};

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await ability(stack);
  },

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
