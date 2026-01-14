import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    if (
      stack.processing.owner.deck.length > 0 &&
      stack.processing.owner.trigger.length < stack.core.room.rule.player.max.trigger
    ) {
      await System.show(stack, '集炎の魔陣', 'トリガーゾーンに4枚までセット');

      EffectHelper.random(
        stack.processing.owner.deck,
        Math.min(stack.core.room.rule.player.max.trigger - stack.processing.owner.trigger.length, 4)
      ).forEach(card => Effect.move(stack, stack.processing, card, 'trigger'));
    }
  },

  onAttackSelf: async (stack: StackWithCard) => {
    const opponentsSelectable = EffectHelper.isUnitSelectable(
      stack.core,
      'opponents',
      stack.processing.owner
    );
    const isCardsInTrigger =
      stack.processing.owner.trigger.length > 0 ||
      stack.processing.owner.opponent.trigger.length > 0;

    if (isCardsInTrigger) {
      await System.show(
        stack,
        '集炎の魔陣',
        `トリガーゾーンを1枚破壊${opponentsSelectable ? '\n3000ダメージ' : ''}`
      );

      EffectHelper.random(stack.processing.owner.trigger, 1).forEach(card =>
        Effect.move(stack, stack.processing, card, 'trash')
      );
      EffectHelper.random(stack.processing.owner.opponent.trigger, 1).forEach(card =>
        Effect.move(stack, stack.processing, card, 'trash')
      );

      if (opponentsSelectable) {
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          'opponents',
          'ダメージを与えるユニットを選んで下さい'
        );
        Effect.damage(stack, stack.processing, target, 3000, 'effect');
      }
    }
  },

  onClockupSelf: async (stack: StackWithCard) => {
    if (stack.processing.owner.deck.length > 0) {
      await System.show(stack, '篝夜に咲く花', 'トリガーゾーンにセット');
      EffectHelper.random(stack.processing.owner.deck).forEach(card =>
        Effect.move(stack, stack.processing, card, 'trigger')
      );
    }
  },
};
