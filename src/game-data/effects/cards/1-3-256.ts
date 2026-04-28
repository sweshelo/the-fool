import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkTurnStart: (stack: StackWithCard) => stack.source.id !== stack.processing.owner.id,
  onTurnStart: async (stack: StackWithCard) => {
    await System.show(stack, '聖光による庇護', '味方全体のBP+5000\n対戦相手のライフ+1');
    stack.processing.owner.field.forEach(unit =>
      Effect.modifyBP(stack, stack.processing, unit, 5000, { event: 'turnEnd', count: 1 })
    );
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, 1);
  },
};
