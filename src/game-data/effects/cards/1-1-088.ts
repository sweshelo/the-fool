import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットがフィールドに出た時
  checkDrive(stack: StackWithCard): boolean {
    const owner = stack.processing.owner;
    if (!(stack.target instanceof Unit)) return false;
    if (stack.target.owner.id !== owner.id) return false;

    // 捨札にトリガーカードがあるか確認
    const triggerCards = owner.trash.filter(card => card.catalog.type === 'trigger');
    return triggerCards.length > 0;
  },

  // あなたの捨札にあるトリガーカードを1枚ランダムで手札に加える
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const triggerCards = owner.trash.filter(card => card.catalog.type === 'trigger');

    await System.show(stack, '黄昏の奇術師', 'トリガーカードを回収');

    // ランダムで1枚選んで手札に加える
    EffectHelper.random(triggerCards, 1).forEach(card => {
      Effect.move(stack, stack.processing, card, 'hand');
    });
  },
};
