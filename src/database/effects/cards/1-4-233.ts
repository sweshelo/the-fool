import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■群れの歪
  // あなたのコスト2以上のユニットがフィールドに出た時、フィールドに出たユニットと同じ種族のユニットがあなたのフィールドに4体以上いる場合、
  // フィールドに出たユニットを破壊する。そうした場合、その種族のユニットカードをデッキから2枚までランダムで手札に加える。
  checkDrive: (stack: StackWithCard) => {
    if (!(stack.target instanceof Unit)) return false;

    for (const species of stack.target.catalog.species ?? []) {
      // フィールド上の同じ種族のユニット数をカウント（今回召喚されたユニットを含む）
      const sameSpeciesCount = stack.target.owner.field.filter(unit =>
        unit.catalog.species?.includes(species)
      ).length;

      // 同じ種族のユニットが4体以上いる場合
      if (sameSpeciesCount >= 4) {
        return true;
      }
    }

    return false;
  },

  // ユニット召喚時
  onDrive: async (stack: StackWithCard): Promise<void> => {
    // 自分のコスト2以上のユニットが召喚された時
    if (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.target.catalog.cost >= 2 && // コスト2以上
      stack.target.catalog.species && // 種族が存在する
      stack.target.catalog.species.length > 0
    ) {
      for (const species of stack.target.catalog.species) {
        // フィールド上の同じ種族のユニット数をカウント（今回召喚されたユニットを含む）
        const sameSpeciesCount = stack.target.owner.field.filter(unit =>
          unit.catalog.species?.includes(species)
        ).length;

        // 同じ種族のユニットが4体以上いる場合
        if (sameSpeciesCount >= 4) {
          await System.show(
            stack,
            '群れの歪',
            `フィールドに出たユニットを破壊\n同種族を2枚まで手札に加える`
          );

          // 召喚されたユニットを破壊
          Effect.break(stack, stack.processing, stack.target, 'effect');

          // デッキから同じ種族のユニットカードを検索
          const sameSpeciesCards = stack.processing.owner.deck.filter(
            card => card instanceof Unit && card.catalog.species?.includes(species)
          );

          if (sameSpeciesCards.length > 0) {
            // ランダムで最大2枚選択
            const selectedCards = EffectHelper.random(
              sameSpeciesCards,
              Math.min(2, sameSpeciesCards.length)
            );

            // 手札に加える
            for (const card of selectedCards) {
              Effect.move(stack, stack.processing, card, 'hand');
            }
          }

          return;
        }
      }
    }
  },
};
