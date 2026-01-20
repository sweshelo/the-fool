import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, '援軍／精霊', '【精霊】ユニットを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, {
      species: '精霊',
    });
  },

  onTurnEnd: async (stack: StackWithCard) => {
    const [target] = EffectHelper.random(stack.processing.owner.opponent.field, 1);
    if (target instanceof Unit && stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      await System.show(stack, '平和の光', '【呪縛】を付与');
      Effect.keyword(stack, stack.processing, target, '呪縛');
    }
  },
};
