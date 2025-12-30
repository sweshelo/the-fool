import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

const ability = async (stack: StackWithCard): Promise<void> => {
  const targets = EffectHelper.candidate(
    stack.core,
    unit => unit.owner.id === stack.processing.owner.opponent.id && unit.catalog.cost <= 3,
    stack.processing.owner
  );

  if (targets.length > 0) {
    await System.show(stack, '金剛の胆力', '行動権を消費');
    const [target] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      targets,
      '行動権を消費するユニットを選択'
    );

    Effect.activate(stack, stack.processing, target, false);
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
