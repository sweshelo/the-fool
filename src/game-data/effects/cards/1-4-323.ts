import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import { EffectTemplate } from '../engine/templates';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkTurnStart: stack => {
    return (
      stack.processing.owner.id === stack.source.id &&
      stack.processing.owner.life.current < stack.processing.owner.opponent.life.current
    );
  },

  onTurnStart: async (stack: StackWithCard) => {
    await System.show(stack, '幻想のメロディー', 'カードを1枚引く\nCP+1');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
