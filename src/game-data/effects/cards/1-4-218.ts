import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';

export const effects: CardEffects = {
  // ユニット: ジェネレイト＜ウィルス・黙＞
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (EffectHelper.isVirusInjectable(stack.processing.owner)) {
      await System.show(
        stack,
        'ジェネレイト＜ウィルス・黙＞',
        '＜ウィルス・黙＞を【特殊召喚】\nインターセプトカードを捨札から1枚回収'
      );
      await EffectTemplate.virusInject(stack, stack.processing.owner, '＜ウィルス・黙＞');
      EffectHelper.random(
        stack.processing.owner.trash.filter(card => card.catalog.type === 'intercept'),
        1
      ).forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
    }
  },
};
