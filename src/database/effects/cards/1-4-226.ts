import { Evolve, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■エンジェル・コール
  // このユニットがフィールドに出た時、あなたのフィールドにユニットが4体以下の場合、あなたのデッキから進化ユニット以外のコスト2以下の【天使】ユニットをランダムで1体【特殊召喚】する。

  // フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // フィールドのユニットが4体以下か確認
    if (owner.field.length <= 4) {
      // デッキから進化ユニット以外のコスト2以下の天使ユニットを検索
      const candidates = owner.deck.filter(
        card =>
          card instanceof Unit &&
          !(card instanceof Evolve) && // 進化ユニット以外
          card.catalog.cost <= 2 &&
          card.catalog.species?.includes('天使') // 天使ユニット
      );

      if (candidates.length > 0) {
        await System.show(stack, 'エンジェル・コール', '【天使】ユニットを特殊召喚');

        // ランダムで1体選ぶ
        const randomUnits = EffectHelper.random(candidates, 1);
        if (randomUnits.length > 0) {
          const targetUnit = randomUnits[0] as Unit;

          // 特殊召喚
          await Effect.summon(stack, stack.processing, targetUnit, false);
        }
      }
    }
  },
};
