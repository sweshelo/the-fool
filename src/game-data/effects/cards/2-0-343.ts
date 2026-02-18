import type { Card } from '@/package/core/class/card';
import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';

export const effects: CardEffects = {
  // インターセプト: 対戦相手のターン終了時、あなたのフィールドのユニットが4体以下の場合
  checkTurnEnd: (stack: StackWithCard<Card>): boolean => {
    return (
      stack.source.id === stack.processing.owner.opponent.id &&
      stack.processing.owner.field.length <= 4
    );
  },

  onTurnEnd: async (stack: StackWithCard<Card>): Promise<void> => {
    const filter = (unit: Unit) =>
      unit.owner.id === stack.processing.owner.id &&
      (unit.catalog.species?.includes('武身') ?? false);

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(
        stack,
        '鍛冶神の業物',
        '【武身】をデッキに戻す\nコスト[戻したユニットのコスト+1]のユニットを【特殊召喚】'
      );

      // 武身ユニットを選択
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        'デッキに戻すユニットを選択'
      );

      const targetCost = target.catalog.cost;

      // デッキに戻す
      Effect.bounce(stack, stack.processing, target, 'deck');

      // コスト+1の武身ユニットをデッキから探す
      const upperBushi = stack.processing.owner.deck.filter(
        card =>
          card instanceof Unit &&
          card.catalog.species?.includes('武身') &&
          card.catalog.cost === targetCost + 1 &&
          !card.catalog.isEvolution
      );

      if (upperBushi.length > 0) {
        const [summonTarget] = EffectHelper.random(upperBushi);
        if (summonTarget instanceof Unit) {
          await Effect.summon(stack, stack.processing, summonTarget);
        }
      }
    }
  },
};
