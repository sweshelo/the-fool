import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import { EffectTemplate } from '@/game-data/effects/engine/templates';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    return stack.processing.owner.id === stack.source.id && stack.processing.owner.hand.length > 0;
  },
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '百花繚乱', '手札を全て捨てる\n同じ枚数カードを引く');
    const handLength = stack.processing.owner.hand.length;
    stack.processing.owner.hand.forEach(card =>
      Effect.break(stack, stack.processing, card, 'effect')
    );
    EffectHelper.repeat(handLength, () => EffectTemplate.draw(stack.processing.owner, stack.core));
  },
};
