import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Card } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkDrive: stack => {
    return stack.source.id === stack.processing.owner.id && stack.processing.owner.field.length > 0;
  },
  onDrive: async (stack: StackWithCard) => {
    await EffectHelper.combine(stack, [
      {
        title: '虚無の現身',
        description: '味方全体を破壊',
        effect: () =>
          stack.processing.owner.field.forEach(unit =>
            Effect.break(stack, stack.processing, unit, 'effect')
          ),
      },
      {
        title: '虚無の現身',
        description: '捨札から2枚回収',
        effect: () =>
          EffectHelper.random<Card>(stack.processing.owner.trash, 2).forEach(card =>
            Effect.move(stack, stack.processing, card, 'hand')
          ),
      },
      {
        title: '虚無の現身',
        description: '1ライフダメージ',
        effect: () =>
          Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1),
        condition: stack.processing.owner.field.length >= 4,
      },
    ]);
  },
};
