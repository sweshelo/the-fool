import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const targets = stack.processing.owner.delete.filter(
      (card): card is Unit => card instanceof Unit && card.catalog.type === 'unit'
    );
    if (targets.length > 0) {
      await System.show(stack, '禁呪の代償', '消滅から特殊召喚');
      await Promise.all(
        EffectHelper.random(targets).map(unit => Effect.summon(stack, stack.processing, unit))
      );
    }
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.delete.length > 0 && stack.processing.owner.id === stack.source.id) {
      await System.show(stack, '禁忌の霊符', '消滅カードを3枚まで捨札に送る');
      EffectHelper.random(stack.processing.owner.delete, 3).forEach(card =>
        Effect.move(stack, stack.processing, card, 'trash')
      );
    }
  },

  onBreakSelf: async (stack: StackWithCard): Promise<void> => {
    const targets = stack.processing.owner.trash.filter(
      (card): card is Unit => card.catalog.type === 'unit' && card.catalog.cost <= 2
    );
    if (
      stack.option?.type === 'break' &&
      stack.option.cause !== 'battle' &&
      stack.option.cause !== 'system' &&
      targets.length > 0
    ) {
      await System.show(stack, '闇の陰陽師', 'コスト2以下を【特殊召喚】');
      await Promise.all(
        EffectHelper.random(targets).map(unit => Effect.summon(stack, stack.processing, unit))
      );
    }
  },
};
