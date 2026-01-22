import { Unit, type Card } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  handEffect: (_core: unknown, self: Card) => {
    const calculator = (self: Card) => -self.owner.delete;
    PermanentEffect.mount(self, {
      effect: (card, source) => Effect.dynamicCost(card, { source, calculator }),
      effectCode: '',
      targets: ['self'],
    });
  },

  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const targetUnits = [
      ...stack.processing.owner.field,
      ...stack.processing.owner.opponent.field,
    ].filter(unit => !unit.catalog.species?.includes('ドラゴン'));
    const targetCards = [
      ...stack.processing.owner.trash,
      ...stack.processing.owner.opponent.trash,
    ].filter(
      card =>
        (card.catalog.type === 'unit' || card.catalog.type === 'advanced_unit') &&
        !card.catalog.species?.includes('ドラゴン')
    );

    await System.show(
      stack,
      'タイラントオブディザイア',
      '【加護】\n【沈黙効果耐性】\nお互いのフィールドと捨札の【ドラゴン】以外を消滅'
    );
    targetUnits.forEach(unit => Effect.delete(stack, stack.processing, unit));
    targetCards.forEach(card => Effect.move(stack, stack.processing, card, 'delete'));
    Effect.keyword(stack, stack.processing, stack.processing, '加護');
    Effect.keyword(stack, stack.processing, stack.processing, '沈黙効果耐性');
  },
};
