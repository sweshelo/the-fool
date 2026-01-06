import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // フォース＜ウィルス・灼＞：フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (EffectHelper.isVirusInjectable(stack.processing.owner.opponent)) {
      await System.show(stack, 'フォース＜ウィルス・灼＞', '＜ウィルス・灼＞を【特殊召喚】');
      await EffectTemplate.virusInject(stack, stack.processing.owner.opponent, '＜ウィルス・灼＞');
    }
  },

  // 灼熱の暴風：アタック時の効果
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '灼熱の暴風', '対戦相手のユニットに2000ダメージ');
    stack.processing.owner.opponent.field.forEach(unit => {
      Effect.damage(stack, stack.processing, unit, 2000);
    });
  },
};
