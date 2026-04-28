import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  // ■増殖
  // このユニットのBPはあなたのフィールドの【昆虫】ユニット1体につき+2000される。
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      effect: (card, source) => {
        if (card instanceof Unit)
          Effect.dynamicBP(
            stack,
            stack.processing,
            card,
            self =>
              self.owner.field.filter(unit => unit.catalog.species?.includes('昆虫')).length * 2000,
            { source }
          );
      },
      effectCode: '増殖',
      targets: ['self'],
    });
  },

  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '増殖', 'BP+[【昆虫】×2000]');
  },
};
