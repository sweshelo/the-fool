import { Unit } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、あなたは紫属性のインターセプトカードを1枚引く。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'インターセプトドロー', '紫属性のインターセプトカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, {
      type: ['intercept'],
      color: Color.PURPLE,
    });
  },
};
