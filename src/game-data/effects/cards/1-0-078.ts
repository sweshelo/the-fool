import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';

export const effects: CardEffects = {
  // ユニットが生存していない可能性があるので生存チェックを行う
  checkDrive: stack => stack.processing.owner.field.some(unit => unit.id === stack.target?.id),
  onDrive: async (stack: StackWithCard) => {
    if (stack.target instanceof Unit) {
      await System.show(stack, 'インペリアルソード', '【スピードムーブ】を与える');
      Effect.speedMove(stack, stack.target);
    }
  },
};
