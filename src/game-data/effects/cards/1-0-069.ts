import type { Card } from '@/package/core/class/card';
import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';

export const effects: CardEffects = {
  // あなたのユニットがフィールドに出た時
  checkDrive: (stack: StackWithCard<Card>): boolean => {
    if (!(stack.target instanceof Unit)) return false;
    if (stack.target.owner.id !== stack.processing.owner.id) return false;

    // 相手のユニットが選択可能か
    return EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner);
  },

  onDrive: async (stack: StackWithCard<Card>): Promise<void> => {
    await System.show(stack, '絶妙な挑発', 'レベルを3にする');

    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      'レベルを3にするユニットを選択'
    );

    Effect.clock(stack, stack.processing, target, 2, true);
  },
};
