import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const targets = stack.processing.owner.opponent.field.filter(unit =>
      unit.hasKeyword('秩序の盾')
    );

    await EffectHelper.combine(stack, [
      {
        title: '無秩序の世界',
        description: '【秩序の盾】を破壊',
        effect: () => targets.forEach(target => Effect.break(stack, stack.processing, target)),
        condition: targets.length > 0,
      },
      {
        title: 'スピードムーブ',
        description: '行動制限の影響を受けない',
        effect: () => Effect.speedMove(stack, stack.processing),
      },
    ]);
  },
};
