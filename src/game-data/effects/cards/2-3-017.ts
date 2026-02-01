import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // フィールドに空きがあるか（最大5体想定）
    const hasFieldSpace = owner.field.length <= 4;

    // デッキから条件に合うユニットを抽出
    const candidates = owner.deck.filter(
      card =>
        card.catalog.type === 'unit' && // ユニット
        card.catalog.species?.includes('昆虫') && // 昆虫
        card.catalog.cost <= 1 // コスト1以下
    );

    if (!hasFieldSpace) return;
    await System.show(
      stack,
      '生殖',
      'デッキから進化ユニット以外のコスト1以下の【昆虫】ユニットをランダムで1体【特殊召喚】'
    );

    const [target] = EffectHelper.random(candidates, 1);
    if (target instanceof Unit) {
      await Effect.summon(stack, stack.processing, target);
    }
  },
};
