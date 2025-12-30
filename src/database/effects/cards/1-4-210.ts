import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  // ユニット: ジェネレイト＜ウィルス・費＞
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (EffectTemplate.virusInjectable(stack.processing.owner)) {
      await System.show(
        stack,
        'ジェネレイト＜ウィルス・費＞',
        '＜ウィルス・費＞を【特殊召喚】\n【加護】を得る'
      );
      await EffectTemplate.virusInject(stack, stack.processing.owner, '＜ウィルス・費＞');
      Effect.keyword(stack, stack.processing, stack.processing, '加護');
    }
  },
};
