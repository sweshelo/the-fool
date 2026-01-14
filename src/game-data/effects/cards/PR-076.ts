import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '熟練の手さばき', '手札を1枚破壊\nカードを1枚引く');
    EffectHelper.random(stack.processing.owner.opponent.hand, 1).forEach(card =>
      Effect.handes(stack, stack.processing, card)
    );
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
