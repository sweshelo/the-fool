import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (
      stack.processing.owner.field.length <= 4 &&
      EffectHelper.isUnitSelectable(stack.core, 'owns', stack.processing.owner)
    ) {
      await System.show(stack, '冥界ランデブー', 'ユニットを【複製】し破壊');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'owns',
        '【複製】し破壊するカードを選択して下さい'
      );
      await Effect.clone(stack, stack.processing, target, stack.processing.owner);
      Effect.break(stack, stack.processing, target, 'effect');
    }
  },

  onTurnStartInTrash: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.source.id !== stack.processing.owner.id) return;
    if (stack.processing.owner.field.length === 0) {
      await System.show(stack, '蘇る爛漫少女', '【特殊召喚】');
      await Effect.summon(stack, stack.processing, stack.processing);
    }
  },
};
