import type { Card } from '@/package/core/class/card';
import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  // あなたのユニットがフィールドに出た時
  checkDrive: (stack: StackWithCard<Card>): boolean => {
    return stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id;
  },

  onDrive: async (stack: StackWithCard<Card>): Promise<void> => {
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(stack, '絶妙な挑発', 'レベルを3にする');

      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'レベルを3にするユニットを選択'
      );

      Effect.clock(stack, stack.processing, target, 2, true);
    }
  },
};
