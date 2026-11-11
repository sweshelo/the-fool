import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkTurnStart: stack => stack.source.id !== stack.processing.owner.id,
  onTurnStart: async (stack: StackWithCard) => {
    await System.show(stack, '神の杯', '味方全体の基本BP+1000\nターン終了時まで【秩序の盾】を付与');
    stack.processing.owner.field.forEach(unit => {
      Effect.modifyBP(stack, stack.processing, unit, 1000, { isBaseBP: true });
      Effect.keyword(stack, stack.processing, unit, '秩序の盾', { event: 'turnEnd', count: 1 });
    });
  },
};
