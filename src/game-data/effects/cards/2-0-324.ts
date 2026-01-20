import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const candidate = stack.processing.owner.deck.filter(
      (card): card is Unit => card.catalog.cost <= 7 && card.catalog.type === 'unit'
    );

    if (candidate.length > 0 && stack.processing.owner.field.length <= 4) {
      const [target] = await EffectHelper.selectCard<Unit>(
        stack,
        stack.processing.owner,
        candidate,
        '【特殊召喚】するユニットカードを選択してください'
      );
      Effect.keyword(stack, stack.processing, stack.processing, '不屈');

      if (target) {
        await Effect.summon(stack, stack.processing, target);
      }
    }
  },

  onTurnStart: async (stack: StackWithCard<Unit>) => {
    const targets = stack.processing.owner.deck.filter(
      card => card.catalog.type === 'unit' && card.catalog.cost <= 3
    );
    const [target] = EffectHelper.random(targets, 1);
    if (
      stack.processing.owner.id === stack.core.getTurnPlayer().id &&
      target instanceof Unit &&
      stack.processing.owner.field.length <= 4
    ) {
      await System.show(stack, '私の救世主さま', 'コスト3以下を【特殊召喚】');
      await Effect.summon(stack, stack.processing, target);
    }
  },
};
