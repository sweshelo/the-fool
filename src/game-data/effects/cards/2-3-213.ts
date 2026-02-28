import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const bp8000filter = (unit: Unit) =>
      unit.owner.id === stack.processing.owner.opponent.id && unit.currentBP >= 8000;
    const choice = await EffectHelper.choice(
      stack,
      stack.processing.owner,
      '選略・究極のしもやけ',
      [
        {
          id: '1',
          description: 'BP8000以上のユニットを破壊',
          condition: EffectHelper.isUnitSelectable(
            stack.core,
            bp8000filter,
            stack.processing.owner
          ),
        },
        {
          id: '2',
          description: 'CP-3\nユニットを破壊',
          condition: EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner),
        },
      ]
    );

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・究極のしもやけ', 'BP8000以上のユニットを破壊');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          bp8000filter,
          '破壊するユニットを選択'
        );
        Effect.break(stack, stack.processing, target);
        break;
      }
      case '2': {
        await System.show(stack, '選略・究極のしもやけ', 'CP-3\nユニットを破壊');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          'opponents',
          '破壊するユニットを選択'
        );
        Effect.break(stack, stack.processing, target);
        Effect.modifyCP(stack, stack.processing, stack.processing.owner, -3);
        break;
      }
    }
  },
};
