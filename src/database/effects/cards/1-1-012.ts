import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const selectableUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.id,
      stack.processing.owner
    );

    if (selectableUnits.length > 0) {
      await System.show(stack, 'アナザーデリート', '自分のユニットを1体破壊\nCP+2');
      const [target] = await EffectHelper.selectUnit(
        stack,
        owner,
        selectableUnits,
        'アナザーデリート - 破壊するユニットを選択してください',
        1
      );

      // 選択したユニットを破壊
      Effect.break(stack, stack.processing, target);

      // CP+2
      Effect.modifyCP(stack, stack.processing, owner, 2);
    }
  },
};
