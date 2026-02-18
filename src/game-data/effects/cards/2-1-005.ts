import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(stack, '焦熱の煌星', '[対戦相手のフィールド×2000]ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'ダメージを与えるユニットを選択してください'
      );
      Effect.damage(stack, stack.processing, target, target.owner.field.length * 2000, 'effect');
    }
  },
};
