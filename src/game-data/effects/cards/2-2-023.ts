import { Effect, EffectHelper, EffectTemplate, System } from '@/game-data/effects';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '../../../package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(
      stack,
      '固着＆艶やかな微笑み',
      '手札に戻らない\n捨札をデッキに戻す\n手札が5枚になるまでカードを引く\nCP-12'
    );
    stack.core.players
      .flatMap(player => player.trash)
      .forEach(card => Effect.move(stack, stack.processing, card, 'deck'));
    EffectHelper.repeat(5 - stack.processing.owner.hand.length, () =>
      EffectTemplate.draw(stack.processing.owner, stack.core)
    );
    Effect.keyword(stack, stack.processing, stack.processing, '固着');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, -12);
  },

  onTurnEnd: async (stack: StackWithCard) => {
    if (stack.source.id !== stack.processing.owner.id) return;

    await System.show(stack, '吹き出す胞子', 'CP+1');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
  },
};
