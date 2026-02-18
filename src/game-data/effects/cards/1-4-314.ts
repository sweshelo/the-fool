import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■逃れられぬ運命
  // このユニットがフィールドに出た時、このユニットを消滅させる。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '逃れられぬ運命', '自身を消滅');
    Effect.delete(stack, stack.processing, stack.processing);
  },

  // ■一滴の光
  // このユニットが破壊された時、対戦相手のユニットを1体選ぶ。それを消滅させる。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '一滴の光', '消滅させる');

    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '消滅させるユニットを選択'
      );

      Effect.delete(stack, stack.processing, target);
    }
  },
};
