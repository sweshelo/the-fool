import { Card, type Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  isBootable: (core: Core, self: Unit) => {
    return self.owner.hand.some(card => card.catalog.type === 'intercept');
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '起動・コネクト', 'インターセプトカードのレベル+1');
    const intercepts = stack.processing.owner.hand.filter(
      card => card.catalog.type === 'intercept'
    );
    const [target] = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      intercepts,
      'レベルを+1するカードを選んで下さい',
      1
    );
    target.lv = Math.min(target.lv + 1, 3);
  },

  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'インターセプトドロー', 'インターセプトカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
  },

  onIntercept: async (stack: StackWithCard): Promise<void> => {
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
    if (
      stack.target instanceof Card &&
      stack.target.catalog.type === 'intercept' &&
      stack.option?.type === 'lv' &&
      stack.option.value >= 2 &&
      stack.target.owner.id === stack.processing.owner.id &&
      EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)
    ) {
      await System.show(stack, 'オルタナティブダクト', '2000ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        'ダメージを与えるユニットを選択して下さい',
        1
      );
      if (target) Effect.damage(stack, stack.processing, target, 2000, 'effect');
    }
  },
};
