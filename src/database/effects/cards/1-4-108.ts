import { Unit } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // フォース＜ウィルス・護＞：フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (EffectTemplate.virusInjectable(stack.processing.owner.opponent)) {
      await System.show(stack, 'フォース＜ウィルス・護＞', '＜ウィルス・護＞を【特殊召喚】');
      await EffectTemplate.virusInject(stack, stack.processing.owner.opponent, '＜ウィルス・護＞');
    }
  },
};
