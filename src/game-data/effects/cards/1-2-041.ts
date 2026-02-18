import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、あなたはインターセプトカードを1枚引く。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'インターセプトドロー', 'インターセプトカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
  },

  // このユニットがオーバークロックした時、対戦相手のユニットを1体選ぶ。それを破壊する。
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対戦相手のユニットを選択可能か確認
    const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.opponent.id;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, '幽玄乱舞', 'ユニットを破壊');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '破壊するユニットを選択して下さい'
      );

      Effect.break(stack, stack.processing, target, 'effect');
    }
  },
};
