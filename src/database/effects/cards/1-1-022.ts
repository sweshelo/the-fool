import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, '援軍／侍', '【侍】ユニットを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '侍' });
  },

  fieldEffect: (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    owner.field.forEach(unit => {
      if (
        unit.catalog.species?.includes('侍') &&
        !unit.delta.some(delta => delta.source?.unit === stack.processing.id)
      ) {
        // 【不屈】を付与
        Effect.keyword(stack, stack.processing, unit, '不屈', {
          source: { unit: stack.processing.id },
        });
      }
    });
  },

  onBattle: async (stack: StackWithCard) => {
    const attacker = stack.source;
    if (
      attacker instanceof Unit &&
      attacker.catalog.species?.includes('侍') &&
      attacker.owner.id === stack.processing.owner.id
    ) {
      await System.show(stack, '心眼の撫子', '基本BP+1000');
      Effect.modifyBP(stack, stack.processing, attacker, 1000, { isBaseBP: true });
    }
  },
};
