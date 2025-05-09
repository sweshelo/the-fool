import { Unit, type Card } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Delta } from '@/package/core/class/delta';
import { Effect } from '../classes/effect';
import { System } from '../classes/system';

export const effects: CardEffects = {
  handEffect: (_core: unknown, self: Card) => {
    const targetDelta = self.delta.find(delta => delta.source?.unit === self.id);
    if (targetDelta && targetDelta.effect.type === 'cost') {
      targetDelta.effect.value = Math.max(-self.owner.delete.length, -14);
    } else {
      self.delta.push(
        new Delta(
          {
            type: 'cost',
            value: Math.max(-self.owner.delete.length, -14),
          },
          undefined,
          undefined,
          undefined,
          { unit: self.id }
        )
      );
    }
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
