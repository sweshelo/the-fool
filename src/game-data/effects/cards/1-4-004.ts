import type { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';
import { EffectHelper } from '../engine/helper';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    if (
      stack.processing.owner.field.some(
        unit => unit.catalog.species?.includes('神獣') && unit.id !== stack.processing.id
      )
    ) {
      await System.show(stack, '常夏の守り神', '【スピードムーブ】を得る');
      Effect.speedMove(stack, stack.processing);
    }
  },

  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(stack, '魔除けの炎', '自身のBP分のダメージを与えあう');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'ダメージを与えるユニットを選択して下さい'
      );
      Effect.damage(stack, stack.processing, stack.processing, stack.processing.currentBP);
      Effect.damage(stack, stack.processing, target, stack.processing.currentBP);
    }
  },
};
