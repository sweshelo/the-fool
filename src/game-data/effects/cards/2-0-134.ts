import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => stack.source.id === stack.processing.owner.id,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, 'グランドライブラリ', '同属性のインターセプトカードを1枚引く');
    const target = stack.target instanceof Unit ? stack.target : undefined;
    EffectHelper.random(
      stack.processing.owner.deck.filter(
        card => card.catalog.type === 'intercept' && card.catalog.color === target?.catalog.color
      )
    ).forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
  },
};
