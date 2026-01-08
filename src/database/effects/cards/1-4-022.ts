import { EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (EffectHelper.isVirusInjectable(stack.processing.owner.opponent)) {
      await System.show(stack, 'フォース＜ウィルス・黙＞', '＜ウィルス・黙＞を【特殊召喚】');
      await EffectTemplate.virusInject(stack, stack.processing.owner.opponent, '＜ウィルス・黙＞');
    }
  },
};
