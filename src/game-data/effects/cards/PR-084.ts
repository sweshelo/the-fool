import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onTurnEnd: async (stack: StackWithCard<Unit>) => {
    if (stack.core.getTurnPlayer().id !== stack.processing.owner.id) {
      await System.show(stack, '天使のおかんむり', '自身のレベル+1');
      Effect.clock(stack, stack.processing, stack.processing, 1);
    }
  },

  onClockupSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.owner.opponent.field.length > 0) {
      await System.show(stack, '天使のいたずら', 'デッキに戻す');
      EffectHelper.random(stack.processing.owner.opponent.field).forEach(unit =>
        Effect.bounce(stack, stack.processing, unit, 'deck')
      );
    }
  },
};
