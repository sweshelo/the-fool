import { Effect, EffectHelper, System } from '..';
import type { StackWithCard } from '../classes/types';

export const effects = {
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
    const opponents = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id
    );
    const isCardsInTrigger =
      stack.processing.owner.trigger.length > 0 ||
      stack.processing.owner.opponent.trigger.length > 0;

    if (isCardsInTrigger) {
      await System.show(
        stack,
        '集炎の魔陣',
        `トリガーゾーンを1枚破壊${opponents.length > 0 ? '\n3000ダメージ' : ''}`
      );

      EffectHelper.random(stack.processing.owner.trigger, 1).forEach(card =>
        Effect.move(stack, stack.processing, card, 'trash')
      );
      EffectHelper.random(stack.processing.owner.opponent.trigger, 1).forEach(card =>
        Effect.move(stack, stack.processing, card, 'trash')
      );

      if (opponents.length > 0) {
        const owner = stack.processing.owner;
        const [target] = await System.prompt(stack, owner.id, {
          title: 'ダメージを与えるユニットを選択',
          type: 'unit',
          items: opponents,
        });
        const unit = stack.processing.owner.opponent.field.find(unit => unit.id === target);
        if (!unit) throw new Error('存在しないユニットが選択されました');
        Effect.damage(stack, stack.processing, unit, 3000, 'effect');
      }
    }
  },

  onClockSelf: async (stack: StackWithCard) => {
    if (stack.processing.owner.deck.length > 0) {
      await System.show(stack, '篝夜に咲く花', 'トリガーゾーンにセット');
      EffectHelper.random(stack.processing.owner.deck).forEach(card =>
        Effect.move(stack, stack.processing, card, 'trigger')
      );
    }
  },
};
