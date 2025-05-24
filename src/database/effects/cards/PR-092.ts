import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'スピードムーブ', '行動制限の影響を受けない');
    Effect.speedMove(stack, stack.processing);
  },

  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const targets = [
      ...stack.processing.owner.field,
      ...stack.processing.owner.opponent.field,
    ].filter(unit => unit.id !== stack.processing.id);

    if (targets.length > 0) {
      await System.show(stack, '盗賊の極意', '自身以外の行動権を消費');
      targets.forEach(unit => Effect.activate(stack, stack.processing, unit, false));
    }
  },

  onPlayerAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.processing.lv <= 2) {
      await System.show(stack, '盗賊の極意', 'レベル+1\nデッキからトリガーカードをセット');
      Effect.clock(stack, stack.processing, stack.processing, 1);
      EffectHelper.random(
        stack.processing.owner.deck.filter(card => card.catalog.type === 'trigger'),
        1
      ).forEach(card => Effect.move(stack, stack.processing, card, 'trigger'));
    }
  },

  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.processing.owner.opponent.trigger.length > 0) {
      await System.show(stack, '盗賊の極意', 'トリガーゾーンをデッキに戻す');
      stack.processing.owner.opponent.trigger.forEach(card =>
        Effect.move(stack, stack.processing, card, 'deck')
      );
    }
  },
};
