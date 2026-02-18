import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

const ability = async (stack: StackWithCard): Promise<void> => {
  const filter = (unit: Unit) => unit.lv >= 2 && unit.owner.id !== stack.processing.owner.id;
  if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
    await System.show(stack, '玲剣の飛断', 'レベル2以上のユニットを1体破壊');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      '破壊するユニットを選択して下さい'
    );
    Effect.break(stack, stack.processing, target, 'effect');
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
