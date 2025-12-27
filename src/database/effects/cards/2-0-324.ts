import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const candidate = stack.processing.owner.deck.filter(
      card => card.catalog.cost <= 7 && card.catalog.type === 'unit'
    );

    if (candidate.length > 0 && stack.processing.owner.field.length <= 4) {
      await System.show(
        stack,
        '私の救世主さま',
        '【不屈】\nデッキからコスト7以下を1体選び【特殊召喚】'
      );
      const choices: Choices = {
        title: '【特殊召喚】するユニットカードを選択してください',
        type: 'card',
        items: candidate,
        count: 1,
      };
      const [response] = await System.prompt(stack, stack.processing.owner.id, choices);
      Effect.keyword(stack, stack.processing, stack.processing as Unit, '不屈');

      const target = candidate.find(card => card.id === response);
      if (target) {
        await Effect.summon(stack, stack.processing, target as Unit);
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
