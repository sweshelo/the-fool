import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { StackWithCard } from '../schema/types';

export const effects = {
  onDriveSelf: async (stack: StackWithCard) => {
    if (stack.processing.owner.trash.length <= 0) return;
    await System.show(stack, '月蝕の棺', '捨札から1枚選んで回収');
    await EffectTemplate.revive(stack, 1);
  },

  onAttackSelf: async (stack: StackWithCard) => {
    const isOpponentsOnField = stack.processing.owner.opponent.field.length > 0;
    const isCardsInTrigger = stack.processing.owner.trigger.length >= 2;

    if (isOpponentsOnField && isCardsInTrigger) {
      await System.show(stack, '必滅の邪眼', 'トリガーゾーンを2枚破壊\nユニットを2体まで破壊');
      EffectHelper.random(stack.processing.owner.opponent.field, 2).forEach(unit =>
        Effect.break(stack, stack.processing, unit, 'effect')
      );
      EffectHelper.random(stack.processing.owner.trigger, 2).forEach(card =>
        Effect.move(stack, stack.processing, card, 'trash')
      );
    }
  },
};
