import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard): boolean => {
    // あなたのユニットがフィールドに出た時
    return stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const level = stack.processing.lv;

    if (level === 1) {
      await System.show(stack, '魔性のペンダント', '紫ゲージ+1');
      await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
    } else if (level >= 2 && level <= 3) {
      await System.show(stack, '魔性のペンダント', 'インターセプトカードを1枚引く\n紫ゲージ+1');

      // インターセプトカードを1枚引く
      EffectTemplate.reinforcements(stack, stack.processing.owner, {
        type: ['intercept'],
      });

      // 紫ゲージ+1
      await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
    }
  },
};
