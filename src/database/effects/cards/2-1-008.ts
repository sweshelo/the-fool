import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 支援狙撃：フィールドに出た時、自分の【戦士】ユニットを1体選び、行動権を回復する
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const targets = EffectHelper.candidate(
      stack.core,
      unit => {
        return (
          unit.owner.id === stack.processing.owner.id &&
          (unit.catalog.species?.includes('戦士') || false) &&
          unit.id !== stack.processing.id
        );
      },
      stack.processing.owner
    );

    if (targets.length > 0) {
      await System.show(stack, '支援狙撃', '行動権回復');

      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        targets,
        '行動権を回復するユニットを選択'
      );

      Effect.activate(stack, stack.processing, target, true);
    }
  },
};
