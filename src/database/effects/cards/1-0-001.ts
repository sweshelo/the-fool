import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  //■ダメージブレイク
  //このユニットがオーバークロックした時、対戦相手のユニットを1体選ぶ。それに4000ダメージを与える。

  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) {
      return;
    }

    await System.show(stack, 'ダメージブレイク', '対戦相手のユニットに4000ダメージ');

    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      'ダメージを与えるユニットを選択'
    );

    Effect.damage(stack, stack.processing, target, 4000);
  },
};
