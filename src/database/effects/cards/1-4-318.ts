import { Evolve, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 途切れぬ血統：ユニットが破壊された時の効果
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // フィールドにユニットが4体以下かチェック
    // デッキから進化ユニット以外のコスト3以下の【ドラゴン】を検索
    const dragonUnits = stack.processing.owner.deck.filter(
      card =>
        card instanceof Unit &&
        !(card instanceof Evolve) &&
        card.catalog.cost <= 3 &&
        (card.catalog.species?.includes('ドラゴン') || false)
    );

    if (stack.processing.owner.field.length <= 4 && dragonUnits.length > 0) {
      await System.show(stack, '途切れぬ血統', 'デッキから【ドラゴン】を特殊召喚');

      // 条件に合うカードがある場合、ランダムで1枚選んで特殊召喚
      const [randomDragon] = EffectHelper.random(dragonUnits, 1);
      if (randomDragon instanceof Unit) {
        await Effect.summon(stack, stack.processing, randomDragon);
      }
    }
  },
};
