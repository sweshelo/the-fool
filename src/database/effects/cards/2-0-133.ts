import { Effect } from '../classes/effect';
import { EffectHelper } from '../classes/helper';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const purple = stack.processing.owner.purple;
    if (purple && purple > 0) {
      await System.show(stack, '無限の混沌', '敵全体に[紫ゲージ×1000]ダメージ');
      stack.processing.owner.opponent.field.forEach(unit =>
        Effect.damage(stack, stack.processing, unit, 1000 * purple)
      );
      await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, -purple);
    }
  },

  onAttackSelf: async (stack: StackWithCard) => {
    if (
      (stack.processing.owner.purple ?? 0) >= 2 &&
      EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)
    ) {
      await System.show(stack, '空間断絶', '手札に戻す\n紫ゲージ-2');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        '手札に戻すユニットを選んで下さい'
      );
      Effect.bounce(stack, stack.processing, target, 'hand');
      await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, -2);
    }
  },

  onBreakSelf: async (stack: StackWithCard) => {
    await System.show(stack, '空間断絶', '紫ゲージ+2');
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 2);
  },
};
