import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (EffectTemplate.virusInjectable(stack.processing.owner.opponent)) {
      await System.show(stack, 'フォース＜ウィルス・焔＞', '＜ウィルス・焔＞を【特殊召喚】');
      EffectTemplate.virusInject(stack, stack.processing.owner.opponent, '＜ウィルス・焔＞');
    }
  },
};
