import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(
      stack,
      '援軍／巨人&まっしゅるガード',
      '【巨人】ユニットを1枚引く\n基本BP+1000\nターン終了時まで【破壊効果耐性】を得る'
    );
    EffectTemplate.reinforcements(stack, stack.processing.owner, {
      species: '巨人',
    });
    Effect.keyword(stack, stack.processing, stack.processing, '破壊効果耐性', {
      event: 'turnEnd',
      count: 1,
    });
    Effect.modifyBP(stack, stack.processing, stack.processing, 1000, { isBaseBP: true });
  },

  onDrive: async (stack: StackWithCard) => {
    if (
      stack.target?.id !== stack.processing.id &&
      stack.target instanceof Unit &&
      stack.processing.owner.field.find(unit => unit.id === stack.target?.id) &&
      stack.target.catalog.species?.includes('巨人')
    ) {
      await System.show(
        stack,
        'まっしゅるガード',
        '基本BP+1000\nターン終了時まで【破壊効果耐性】を与える'
      );
      Effect.keyword(stack, stack.processing, stack.target, '破壊効果耐性', {
        event: 'turnEnd',
        count: 1,
      });
      Effect.modifyBP(stack, stack.processing, stack.target, 1000, { isBaseBP: true });
    }
  },
};
