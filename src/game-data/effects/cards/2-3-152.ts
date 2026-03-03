import master from '@/game-data/catalog';
import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkTurnStart: (stack: StackWithCard) => stack.source.id !== stack.processing.owner.id,
  onTurnStart: async (stack: StackWithCard) => {
    await System.show(stack, 'アンデッドパレード', 'ランダムな【不死】を3枚作成');
    [stack.processing.owner, stack.processing.owner.opponent].forEach(player => {
      EffectHelper.repeat(3, () => {
        const [card] = EffectHelper.random(
          Array.from(master.values()).filter(catalog => catalog.species?.includes('不死'))
        );
        if (card?.id) {
          Effect.make(stack, player, card?.id);
        }
      });
    });
  },
};
