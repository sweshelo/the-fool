import { Evolve, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■ブラン・アヴァランチ
  // このユニットが破壊された時、ラウンド数が偶数で、あなたのフィールドにユニットが4体以下の場合、あなたの捨札にある進化ユニットカード以外のコスト3以下の【巨人】ユニットをランダムで1体【特殊召喚】する。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // ラウンド数が偶数かチェック
    if (stack.core.round % 2 !== 0) return;

    // フィールドにユニットが4体以下かチェック
    if (owner.field.length > 4) return;

    // 捨札にある進化ユニット以外のコスト3以下の【巨人】ユニットを検索
    const candidates = owner.trash.filter(
      card =>
        card instanceof Unit &&
        !(card instanceof Evolve) &&
        card.catalog.cost <= 3 &&
        card.catalog.species?.includes('巨人')
    );

    if (candidates.length === 0) return;

    await System.show(stack, 'ブラン・アヴァランチ', '【巨人】ユニットを特殊召喚');

    // ランダムで1体選ぶ
    const [target] = EffectHelper.random(candidates, 1);
    if (target instanceof Unit) {
      await Effect.summon(stack, stack.processing, target, false);
    }
  },
};
