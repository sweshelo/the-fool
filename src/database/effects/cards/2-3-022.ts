import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '加護＆精神統一の構え', '効果に選ばれない\n紫ゲージ+1');
    Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
    Effect.keyword(stack, stack.processing, stack.processing, '加護');
  },

  onTurnStart: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      await System.show(stack, '精神統一の構え', '紫ゲージ+1');
      Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
    }
  },

  onBattle: async (stack: StackWithCard) => {
    if (
      stack.source instanceof Unit &&
      stack.target instanceof Unit &&
      stack.source.currentBP === stack.target.currentBP
    ) {
      await System.show(stack, '不毛戦法', 'ユニットを消滅');
      const target = [stack.source, stack.target].find(unit => unit.id !== stack.processing.id);
      if (target) Effect.delete(stack, stack.processing, target);
    }
  },
};
