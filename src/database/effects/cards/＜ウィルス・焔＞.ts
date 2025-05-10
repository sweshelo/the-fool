import { Color } from '@/submodule/suit/constant/color';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const hasRedCardAtLeast5InTrash =
      stack.processing.owner.opponent.trash.filter(card => card.catalog.color === Color.RED)
        .length >= 5;
    const candidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.id,
      stack.processing.owner.opponent
    );
    const isOpponentUnitDriven = stack.source.id !== stack.processing.owner.id;

    if (isOpponentUnitDriven && hasRedCardAtLeast5InTrash && candidate.length > 0) {
      await System.show(stack, '＜ウィルス・焔＞', '1000ダメージ');
      const [unitId] = await System.prompt(stack, stack.processing.owner.opponent.id, {
        type: 'unit',
        title: 'ダメージを与えるユニットを選択',
        items: candidate,
      });

      const target = candidate.find(unit => unit.id === unitId);
      if (target) {
        Effect.damage(stack, stack.processing, target, 1000, 'effect');
      }
    }
  },
};
