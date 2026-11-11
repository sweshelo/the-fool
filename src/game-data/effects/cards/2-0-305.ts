import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

const ability = async (stack: StackWithCard): Promise<void> => {
  const allUnits = stack.processing.owner.field;

  if (allUnits.length > 0) {
    await System.show(stack, '閃槍の決起', '全てのユニットのレベル+1');
    for (const unit of allUnits) {
      Effect.clock(stack, stack.processing, unit, 1);
    }
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

  // あなたの【武身】に【無我の境地】を与える
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      targets: ['owns'],
      condition: unit => unit.catalog.species?.includes('武身'),
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.keyword(stack, stack.processing, unit, '無我の境地', { source });
        }
      },
      effectCode: '無我の境地',
    });
  },
};
