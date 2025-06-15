import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';
import type { KeywordEffect } from '@/submodule/suit/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(
      stack,
      '援軍／神獣\n守護のメロディー',
      '【神獣】ユニットを1枚引く\n基本BP+1000\n【固着】または【無我の境地】または【消滅効果耐性】を付与'
    );
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '神獣' });
    Effect.modifyBP(stack, stack.processing, stack.processing, 1000, { isBaseBP: true });
    const [keyword] = EffectHelper.random<KeywordEffect>(['固着', '無我の境地', '消滅効果耐性']);
    if (keyword) Effect.keyword(stack, stack.processing, stack.processing, keyword);
  },

  onDrive: async (stack: StackWithCard) => {
    const target = stack.target;
    if (!(target instanceof Unit) || target.catalog.species?.includes('神獣') === false) {
      return;
    }

    // 自身の場合は除外
    if (target.id === stack.processing.id) {
      return;
    }

    await System.show(
      stack,
      '守護のメロディー',
      '基本BP+1000\n【固着】または【無我の境地】または【消滅効果耐性】を付与'
    );
    Effect.modifyBP(stack, stack.processing, target, 1000, { isBaseBP: true });
    const [keyword] = EffectHelper.random<KeywordEffect>(['固着', '無我の境地', '消滅効果耐性']);
    if (keyword) Effect.keyword(stack, stack.processing, target, keyword);
  },
};
