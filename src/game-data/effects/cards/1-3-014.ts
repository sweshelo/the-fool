import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■トリックサーチ
  // このユニットがフィールドに出た時、対戦相手のフィールドに行動済ユニットがいる場合、あなたの捨札にあるトリガーカードを1枚ランダムで手札に加える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のフィールドに行動済ユニットがいるか確認
    const hasInactiveUnit = opponent.field.some(unit => !unit.active);
    if (!hasInactiveUnit) return;

    // 捨札にトリガーカードがあるか確認
    const triggerCards = owner.trash.filter(card => card.catalog.type === 'trigger');
    if (triggerCards.length === 0) return;

    await System.show(stack, 'トリックサーチ', '捨札からトリガーカードを手札に加える');

    // ランダムで1枚選んで手札に加える
    EffectHelper.random(triggerCards, 1).forEach(card => {
      Effect.move(stack, stack.processing, card, 'hand');
    });
  },
};
