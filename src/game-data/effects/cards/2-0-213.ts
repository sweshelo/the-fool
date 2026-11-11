import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import { EffectTemplate } from '@/game-data/effects/engine/templates';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Color } from '@/submodule/suit/constant';

export const effects: CardEffects = {
  onOverclockSelf: async (stack: StackWithCard) => {
    await System.show(stack, '抗体促進弾', '味方全体に【固着】と【秩序の盾】付与');
    stack.processing.owner.field.forEach(unit => {
      Effect.keyword(stack, stack.processing, unit, '固着');
      Effect.keyword(stack, stack.processing, unit, '秩序の盾');
    });
  },
  onTurnStart: async (stack: StackWithCard) => {
    if (stack.source.id !== stack.processing.owner.id || stack.core.round % 2 === 0) return;
    await System.show(stack, '抗体促進弾', '緑属性のインターセプトカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, {
      color: Color.GREEN,
      type: ['intercept'],
    });
  },
};
