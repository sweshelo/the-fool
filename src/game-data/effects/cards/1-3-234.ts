import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    return stack.source.id === stack.processing.owner.id;
  },
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '狂犬の採掘', 'コスト4以上のインターセプトカードを1枚引く');

    const targets = EffectHelper.random(
      stack.processing.owner.deck.filter(
        card => card.catalog.type === 'intercept' && card.catalog.cost >= 4
      ),
      2
    );
    targets.forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
  },
};
