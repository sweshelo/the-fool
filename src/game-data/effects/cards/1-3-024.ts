import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  onAttackSelf: async (stack: StackWithCard) => {
    if (stack.processing.owner.opponent.field.length === 0) return;
    await System.show(stack, '屍竜の雄叫び', '敵全体に【沈黙】を付与');
    stack.processing.owner.opponent.field.forEach(unit =>
      Effect.keyword(stack, stack.processing, unit, '沈黙', { event: 'turnEnd', count: 1 })
    );
  },
  onBreakSelf: async (stack: StackWithCard) => {
    const [target] = EffectHelper.random(stack.processing.owner.opponent.hand);
    if (!target) return;
    await System.show(stack, 'ロスト', '手札を1枚破壊');
    Effect.break(stack, stack.processing, target, 'effect');
  },
};
