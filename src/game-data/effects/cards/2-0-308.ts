import { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';
import { EffectHelper } from '../engine/helper';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;

    const choice = await EffectHelper.choice(stack, stack.processing.owner, '選略・妖艶の夜光', [
      {
        id: '1',
        description: '行動権を消費する',
        condition: owner.opponent.field.some(unit => unit.active),
      },
      {
        id: '2',
        description: '【呪縛】を与える',
        condition: owner.opponent.field.some(unit => !unit.active),
      },
    ]);

    switch (choice) {
      case '1': {
        const [target] = EffectHelper.random(owner.opponent.field.filter(unit => unit.active));
        await System.show(stack, '選略・妖艶の夜光', '行動権を消費する');
        if (target) Effect.activate(stack, self, target, false);
        break;
      }
      case '2': {
        const [target] = EffectHelper.random(owner.opponent.field.filter(unit => !unit.active));
        await System.show(stack, '選略・妖艶の夜光', '【呪縛】を与える');
        if (target) Effect.keyword(stack, self, target, '呪縛');
        break;
      }
    }
  },
};
