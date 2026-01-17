import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

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
    await System.show(stack, '魔力解放', '捨札からカードを1枚手札に加える\nカードを1枚引く');

    // 捨札からランダムで1枚手札に加える
    const trashCards = stack.processing.owner.trash;
    if (trashCards.length > 0) {
      const randomCards = EffectHelper.random(trashCards, 1);
      if (randomCards.length > 0 && randomCards[0]) {
        Effect.move(stack, stack.processing, randomCards[0], 'hand');
      }
    }

    // カードを1枚引く
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
