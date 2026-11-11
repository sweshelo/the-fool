import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkDrive: stack =>
    EffectHelper.isUnitSelectable(
      stack.core,
      (unit: Unit) => unit.lv === 1 || unit.lv === 3,
      stack.processing.owner
    ),
  onDrive: async (stack: StackWithCard) => {
    const field = [...stack.processing.owner.field, ...stack.processing.owner.opponent.field];
    const [choice] =
      (await EffectHelper.choice(stack, stack.processing.owner, '選略・海精の悪戯', [
        { id: '1', description: 'レベル+1', condition: field.some(unit => unit.lv === 1) },
        { id: '2', description: 'レベル-1', condition: field.some(unit => unit.lv === 3) },
      ])) ?? [];

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・海精の悪戯', 'レベル+1');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          unit => unit.lv === 1,
          'レベルを+1するユニットを選択して下さい'
        );
        Effect.clock(stack, stack.processing, target, 1);
        break;
      }
      case '2': {
        await System.show(stack, '選略・海精の悪戯', 'レベル-1');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          unit => unit.lv === 3,
          'レベルを-1するユニットを選択して下さい'
        );
        Effect.clock(stack, stack.processing, target, -1);
        break;
      }
    }
  },
};
