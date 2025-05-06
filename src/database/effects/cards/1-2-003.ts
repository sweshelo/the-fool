import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onAttack: async (stack: StackWithCard): Promise<void> => {
    if (stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id) {
      await System.show(stack, 'アタック・クロック', 'レベルを1上げる');
      Effect.clock(stack, stack.processing, stack.target, 1);
    }
  },

  onClockup: async (stack: StackWithCard): Promise<void> => {
    const candidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id
    );

    if (
      stack.target instanceof Unit &&
      stack.processing.owner.id === stack.target.owner.id &&
      stack.target.lv === 3 &&
      candidate.length > 0
    ) {
      await System.show(stack, '紅蓮のオーバーフレア', '4000ダメージ');
      const [unitId] = await System.prompt(stack, stack.processing.owner.id, {
        type: 'unit',
        title: 'ダメージを与えるユニットを選択',
        items: candidate,
      });

      const unit = candidate.find(unit => unit.id === unitId);
      if (unit) Effect.damage(stack, stack.processing, unit, 4000, 'effect');
    }
  },

  onClockupSelf: async (stack: StackWithCard): Promise<void> => {
    const targets = stack.processing.owner.opponent.field.filter(unit => unit.lv === 3);
    if (targets.length > 0) {
      await System.show(stack, '紅蓮のグロウバーン', '敵全体のレベル3以上のユニットに5000ダメージ');
      targets.forEach(unit => Effect.damage(stack, stack.processing, unit, 5000, 'effect'));
    }

    await effects.onClockup?.(stack);
  },
};
