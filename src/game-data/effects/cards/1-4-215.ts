import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

const ability = async (stack: StackWithCard): Promise<void> => {
  if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
    await System.show(stack, '聖槍の瞬撃', '手札に戻す');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      '手札に戻すユニットを選んで下さい'
    );
    Effect.bounce(stack, stack.processing, target, 'hand');
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
