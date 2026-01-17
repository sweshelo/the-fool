import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '王の治癒力', '自身のBP未満のダメージを受けない');
    Effect.keyword(stack, stack.processing, stack.processing, '王の治癒力');
  },

  onBattle: async (stack: StackWithCard<Unit>): Promise<void> => {
    switch (stack.processing.lv) {
      case 1:
      case 2: {
        await System.show(stack, '深緑の守護者', '基本BP-1000');
        const [target] = [stack.source, stack.target].filter(
          (v): v is Unit => v instanceof Unit && stack.processing.owner.opponent.find(v).result
        );
        if (target) Effect.modifyBP(stack, stack.processing, target, -1000, { isBaseBP: true });
        break;
      }
      case 3: {
        await System.show(stack, '深緑の守護者', '敵全体の基本BP-3000\n自身のレベル-2');
        stack.processing.owner.opponent.field.forEach(unit =>
          Effect.modifyBP(stack, stack.processing, unit, -3000, { isBaseBP: true })
        );
        Effect.clock(stack, stack.processing, stack.processing, -2);
        break;
      }
    }
  },
};
