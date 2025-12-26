import { Color } from '@/submodule/suit/constant/color';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

const TARGET_COLOR = Color.RED;

export const effects: CardEffects = {
  checkAttack: (stack: StackWithCard) => {
    return (
      stack.processing.owner.id !== stack.source.id &&
      !!stack.processing.owner.trash.find(
        card =>
          card.catalog.type === 'unit' &&
          card.catalog.cost <= 2 &&
          card.catalog.color === TARGET_COLOR
      ) &&
      stack.processing.owner.field.length <= 4
    );
  },

  onAttack: async (stack: StackWithCard): Promise<void> => {
    const [target] = EffectHelper.random(
      stack.processing.owner.trash.filter(
        card =>
          card.catalog.type === 'unit' &&
          card.catalog.cost <= 2 &&
          card.catalog.color === TARGET_COLOR
      )
    );
    if (!target || !(target instanceof Unit)) throw new Error('1-3-055: 不正なTarget');
    await System.show(stack, '紅炎の召喚術', '捨札から【特殊召喚】');
    Effect.summon(stack, stack.processing, target);
  },
};
