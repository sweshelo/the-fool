import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';
import { EffectTemplate } from '../engine/templates';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, '風遁・鎌鼬', 'レベル3以上のユニットに【貫通】を付与');
  },
  onPlayerAttackSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.lv <= 2) {
      await System.show(stack, '風遁・隼', 'レベル+1\nカードを1枚引く');
      Effect.clock(stack, stack.processing, stack.processing, 1);
      EffectTemplate.draw(stack.processing.owner, stack.core);
    }
  },
  fieldEffect: (stack: StackWithCard) => {
    PermanentEffect.mount(stack.processing, {
      targets: ['owns'],
      condition: unit => unit.lv >= 3,
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.keyword(stack, stack.processing, unit, '貫通', { source });
        }
      },
      effectCode: '風遁・鎌鼬',
    });
  },
};
