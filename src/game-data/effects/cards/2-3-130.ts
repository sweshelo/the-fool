import { Effect } from '@/game-data/effects/engine/effect';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Intercept, type Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(
      stack,
      '禁忌の呪法＆泡沫夢幻の刻',
      'トリガーゾーンのインターセプトカードを使用できない\nデスカウンター[3]を得る'
    );
    Effect.death(stack, stack.processing, stack.processing, 3);
  },
  fieldEffect: (stack: StackWithCard) => {
    PermanentEffect.mount(stack.processing, {
      effect: (card, source) => Effect.ban(stack, stack.processing, card, { source }),
      effectCode: '禁忌の呪法',
      condition: card =>
        stack.core.getTurnPlayer().id !== card.owner.id && card instanceof Intercept,
      targets: ['opponents', 'trigger'],
    });
  },
};
