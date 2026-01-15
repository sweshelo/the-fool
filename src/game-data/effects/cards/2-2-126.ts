import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.trigger.length > 0) {
      await System.show(stack, 'GO！GO！アルカナパレード♪　', '紫ゲージ+[トリガーゾーンの枚数×1]');
      await Effect.modifyPurple(
        stack,
        stack.processing,
        stack.processing.owner,
        stack.processing.owner.trigger.length
      );
    }
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    const intercept = stack.processing.owner.deck.filter(card => card.catalog.type === 'intercept');
    if (
      intercept.length > 0 &&
      stack.processing.owner.trigger.length < stack.core.room.rule.player.max.trigger
    ) {
      await System.show(stack, '夢の国からサプライズ♪', 'デッキからトリガーゾーンにセット');
      const [target] = EffectHelper.random(intercept, 1);
      if (target) Effect.move(stack, stack.processing, target, 'trigger');
    }
  },
};
