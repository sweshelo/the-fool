import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

async function overFlare(stack: StackWithCard): Promise<void> {
  await System.show(stack, '紅蓮のオーバーフレア', '4000ダメージ');

  const [unit] = await EffectHelper.pickUnit(
    stack,
    stack.processing.owner,
    'opponents',
    'ダメージを与えるユニットを選択'
  );

  Effect.damage(stack, stack.processing, unit, 4000, 'effect');
}

export const effects: CardEffects = {
  onAttack: async (stack: StackWithCard): Promise<void> => {
    if (stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id) {
      await System.show(stack, 'アタック・クロック', 'レベルを1上げる');
      Effect.clock(stack, stack.processing, stack.target, 1);
    }
  },

  onClockup: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (
      stack.target instanceof Unit &&
      stack.processing.owner.id === stack.target.owner.id &&
      stack.target.lv === 3 &&
      stack.processing.id !== stack.target.id &&
      EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)
    ) {
      await overFlare(stack);
    }
  },

  onClockupSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const targets = stack.processing.owner.opponent.field.filter(unit => unit.lv === 3);
    if (targets.length > 0) {
      await System.show(stack, '紅蓮のグロウバーン', '敵全体のレベル3以上のユニットに5000ダメージ');
      targets.forEach(unit => Effect.damage(stack, stack.processing, unit, 5000, 'effect'));
    }

    if (
      stack.target instanceof Unit &&
      stack.processing.owner.id === stack.target.owner.id &&
      stack.target.lv === 3 &&
      EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)
    ) {
      await overFlare(stack);
    }
  },
};
