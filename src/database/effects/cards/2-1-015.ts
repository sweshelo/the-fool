import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    // 自分の他のユニットを全て破壊し、破壊したユニット数をカウント
    const unitsToDestroy = owner.field.filter(unit => unit.id !== stack.processing.id);
    const destroyCount = unitsToDestroy.length;

    // 条件確認：捨札にカードがあり、フィールドにユニットが2体以上
    if (owner.trash_selectable && owner.field.length >= 2 && owner.deck.length > 10) {
      await System.show(
        stack,
        '魂沌遊戯',
        `デッキを10枚になるまで捨てる\n自身以外の味方全体を破壊\n捨札から${destroyCount}枚回収`
      );

      // デッキが10枚になるようにカードを捨てる
      const discardCount = owner.deck.length - 10;
      const cardsToDiscard = owner.deck.slice(0, discardCount);

      for (const card of cardsToDiscard) {
        Effect.move(stack, stack.processing, card, 'trash');
      }

      for (const unit of unitsToDestroy) {
        Effect.break(stack, stack.processing, unit);
      }

      // 捨札からランダムでカードを手札に加える
      if (destroyCount > 0 && owner.hand.length < stack.core.room.rule.player.max.hand) {
        const cardsToAdd = EffectHelper.random(owner.trash, destroyCount);

        for (const card of cardsToAdd) {
          if (card && owner.hand.length < stack.core.room.rule.player.max.hand) {
            Effect.move(stack, stack.processing, card, 'hand');
          }
        }
      }
    }
  },

  onBreak: async (stack: StackWithCard): Promise<void> => {
    // 味方ユニットが破壊された時
    if (stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id) {
      const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
      if (opponentUnits_selectable) {
        await System.show(stack, '魂沌遊戯', '【沈黙】とデスカウンター[1]を付与');

        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          '【沈黙】とデスカウンター[1]を与えるユニットを選択'
        );

        // 沈黙とデスカウンターを付与
        Effect.keyword(stack, stack.processing, target, '沈黙');
        Effect.death(stack, stack.processing, target, 1);
      }
    }
  },
};
