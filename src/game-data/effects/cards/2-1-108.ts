import { Trigger, Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, '王頂よりの威光', 'トリガーゾーンにあるカードを使用できない');
  },

  fieldEffect: (stack: StackWithCard) => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Trigger) Effect.ban(stack, stack.processing, target, { source });
      },
      targets: ['opponents', 'trigger'],
      effectCode: '王頂よりの威光',
    });
  },

  onBlockSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'ブロッカー', 'BP+2000');
    Effect.modifyBP(stack, stack.processing, stack.processing, 2000, {
      event: 'turnEnd',
      count: 1,
    });
  },
};
