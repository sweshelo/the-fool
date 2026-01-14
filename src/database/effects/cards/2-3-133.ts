import { Card, type Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '秩序の盾', '対戦相手の効果によるダメージを受けない');
    Effect.keyword(stack, stack.processing, stack.processing, '秩序の盾');
  },

  onIntercept: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (
      stack.target instanceof Card &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.target.catalog.type === 'intercept' &&
      stack.option?.type === 'lv'
    ) {
      switch (stack.option.value) {
        case 2: {
          await System.show(stack, 'サイド・エフェクト', '基本BP+1000');
          Effect.modifyBP(stack, stack.processing, stack.processing, 1000, {
            isBaseBP: true,
          });
          break;
        }
        case 3: {
          const filter = (unit: Unit) =>
            unit.owner.id !== stack.processing.owner.id && unit.catalog.cost <= 2;

          if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
            await System.show(stack, 'サイド・エフェクト', 'コスト2以下を消滅');
            const [target] = await EffectHelper.pickUnit(
              stack,
              stack.processing.owner,
              filter,
              '消滅させるユニットを選択して下さい'
            );
            Effect.delete(stack, stack.processing, target);
          }
        }
      }
    }
  },
};
