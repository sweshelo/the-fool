import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onAttackSelf: async (stack: StackWithCard): Promise<void> => {
    const candidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id
    );

    if (candidate.length > 0) {
      await System.show(stack, 'お手並み拝見', '【強制防御】を付与');
      const [unitId] = await System.prompt(stack, stack.processing.owner.id, {
        type: 'unit',
        title: '【強制防御】を与えるユニットを選択',
        items: candidate,
      });

      const target = candidate.find(unit => unit.id === unitId);
      if (target) {
        Effect.keyword(stack, stack.processing, target, '強制防御');
      }
    }
  },

  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      await System.show(stack, '成長する戦士', '基本BP+1000');
      Effect.modifyBP(stack, stack.processing, stack.processing as Unit, 1000, { isBaseBP: true });
    }
  },
};
