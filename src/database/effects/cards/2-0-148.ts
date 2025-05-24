import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard): boolean => {
    // あなたのユニットがフィールドに出た時、あなたの紫ゲージが3以上の場合
    return (
      stack.target instanceof Unit &&
      stack.processing.owner.id === stack.target.owner.id &&
      (stack.processing.owner.purple ?? 0) >= 3
    );
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'ナイトガーデン', 'CP+2\nカードを1枚引く');

    // CP+2
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 2);

    // カードを1枚引く
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
