import { Color } from '@/submodule/suit/constant/color';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const hasRedCardAtLeast5InTrash =
      stack.processing.owner.opponent.trash.filter(card => card.catalog.color === Color.RED)
        .length >= 5;
    const isOpponentUnitDriven = stack.source.id !== stack.processing.owner.id;

    if (
      isOpponentUnitDriven &&
      hasRedCardAtLeast5InTrash &&
      EffectHelper.isUnitSelectable(stack.core, 'owns', stack.processing.owner)
    ) {
      await System.show(stack, '＜ウィルス・焔＞', '1000ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'owns',
        'ダメージを与えるユニットを選択'
      );
      if (target) {
        Effect.damage(stack, stack.processing, target, 1000, 'effect');
      }
    }
  },
};
