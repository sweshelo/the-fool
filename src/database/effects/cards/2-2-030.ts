import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  isBootable: (): boolean => {
    return true;
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '起動・ハロウ・イブ', '基本BP-1000\n紫ゲージ+1');
    Effect.modifyBP(stack, stack.processing, stack.processing, -1000, { isBaseBP: true });
    Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
  },

  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const [target] = EffectHelper.random(
      stack.processing.owner.hand.filter(card => card.catalog.type === 'intercept')
    );
    if (target) {
      await System.show(stack, 'トリック・オア・デス', 'インターセプトカードのコスト-1');
      target.delta.push(new Delta({ type: 'cost', value: -1 }));
    }
  },
};
