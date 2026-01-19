import { Effect, EffectTemplate, PermanentEffect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(
      stack,
      '援軍／侍＆心眼の撫子',
      '【侍】ユニットを1枚引く\n【侍】に【不屈】を与える'
    );
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '侍' });
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    // 【侍】ユニットに【不屈】を付与
    PermanentEffect.mount(stack, stack.processing, {
      targets: ['owns'],
      effect: (unit, option) => Effect.keyword(stack, stack.processing, unit, '不屈', option),
      condition: unit => unit.catalog.species?.includes('侍') ?? false,
      effectCode: '心眼の撫子',
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
