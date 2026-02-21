import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    return stack.source.id === stack.processing.owner.id;
  },
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '愛犬の採掘', 'コスト4以上のユニットカードを1枚引く');

    const [target] = EffectHelper.random(
      stack.processing.owner.deck.filter(
        card => card.catalog.type === 'unit' && card.catalog.cost >= 4
      )
    );
    if (target) Effect.move(stack, stack.processing, target, 'hand');
  },
};
