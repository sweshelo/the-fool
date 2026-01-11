import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import { EffectTemplate } from '../classes/templates';
import type { CardEffects, StackWithCard } from '../classes/types';

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
