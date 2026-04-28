import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import { EffectTemplate } from '@/game-data/effects/engine/templates';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkBreak: (stack: StackWithCard) =>
    stack.target instanceof Unit &&
    stack.target.owner.id === stack.processing.owner.id &&
    (stack.processing.owner.purple ?? 0) >= 3,
  onBreak: async (stack: StackWithCard) => {
    await System.show(stack, '丑の刻参り', '1ライフダメージ\nカードを1枚引く');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
