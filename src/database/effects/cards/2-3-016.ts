import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '瑞獣の霊壁', '【加護】\nBPが最も高い【神獣】に【秩序の盾】');

    // BPが最も高い【神獣】ユニットを特定
    const divineBeasts = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('神獣')
    );
    if (divineBeasts.length === 0) {
      return;
    }

    // BPの最大値を取得
    const maxBP = Math.max(...divineBeasts.map(unit => unit.bp));
    // BPが最大値の【神獣】ユニットを抽出
    const highestBPUnits = divineBeasts.filter(unit => unit.bp === maxBP);
    // ランダムで1体選択
    const [target] = EffectHelper.random(highestBPUnits);
    if (!target) {
      return;
    }

    Effect.keyword(stack, stack.processing, target, '秩序の盾');
    Effect.keyword(stack, stack.processing, stack.processing, '加護');
  },
};
