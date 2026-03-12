import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

const ability = async (stack: StackWithCard): Promise<void> => {
  await System.show(
    stack,
    '護剣の戦舞',
    '味方全体の基本BP+2000\n【武身】に【不屈】と【貫通】を与える'
  );
  stack.processing.owner.field.forEach(unit =>
    Effect.modifyBP(stack, stack.processing, unit, 2000, { isBaseBP: true })
  );
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

  fieldEffect: (stack: StackWithCard) => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.keyword(stack, stack.processing, target, '不屈', { source });
      },
      effectCode: '護剣の戦舞_不屈',
      targets: ['owns'],
      condition: target => target instanceof Unit && target.catalog.species?.includes('武身'),
    });
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.keyword(stack, stack.processing, target, '貫通', { source });
      },
      effectCode: '護剣の戦舞_貫通',
      targets: ['owns'],
      condition: target => target instanceof Unit && target.catalog.species?.includes('武身'),
    });
  },
};
