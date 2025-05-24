import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '夜の為に', '紫ゲージ+1');
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
  },

  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'パーリ・ナイト', '進化ユニットカードを1枚引く\n紫ゲージ+1');

    // 進化ユニットカードを1枚引く
    EffectTemplate.reinforcements(stack, stack.processing.owner, {
      type: ['advanced_unit'],
    });

    // 紫ゲージ+1
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
  },

  onDeleteSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'パーリ・ナイト', '進化ユニットカードを1枚引く\n紫ゲージ+1');

    // 進化ユニットカードを1枚引く
    EffectTemplate.reinforcements(stack, stack.processing.owner, {
      type: ['advanced_unit'],
    });

    // 紫ゲージ+1
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
  },
};
