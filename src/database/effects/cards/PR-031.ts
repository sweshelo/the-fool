import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';
import { EffectTemplate } from '../classes/templates';

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
    stack.processing.owner.field.forEach(unit => {
      if (unit.lv >= 3 && !unit.delta.some(delta => delta.source?.unit === stack.processing.id)) {
        Effect.keyword(stack, stack.processing, unit, '貫通', {
          source: { unit: stack.processing.id, effectCode: '風遁・鎌鼬' },
        });
      }
      if (unit.lv < 3 && unit.delta.some(delta => delta.source?.unit === stack.processing.id)) {
        Effect.removeKeyword(stack, unit, '貫通', {
          source: { unit: stack.processing.id, effectCode: '風遁・鎌鼬' },
        });
      }
    });
  },
};
