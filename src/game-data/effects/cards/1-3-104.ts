import { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

const effect = async (stack: StackWithCard) => {
  if (stack.target instanceof Unit && stack.target.catalog.species?.includes('侍')) {
    await System.show(stack, '扶翼の天才剣士', 'BP+1000');
    Effect.modifyBP(stack, stack.processing, stack.target, 1000, { event: 'turnEnd', count: 1 });
  }
};

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    if (
      stack.processing.owner.field.some(
        unit => unit.catalog.species?.includes('侍') && unit.id !== stack.processing.id
      )
    ) {
      await System.show(stack, '口伝・真如剣', 'トリガーゾーンにあるカードを1枚破壊');
      const [target] = EffectHelper.random(stack.processing.owner.trigger);
      if (target) Effect.move(stack, stack.processing, target, 'trash');
    }
  },
  onAttackSelf: effect,
  onAttack: async (stack: StackWithCard) => {
    if (stack.target?.id !== stack.processing.id) await effect(stack);
  },
};
