import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const targets = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );
    if (targets.length > 0) {
      await System.show(stack, '焦熱の煌星', '[対戦相手のフィールド×2000]ダメージ');
      const choices: Choices = {
        title: 'ダメージを与えるユニットを選択してください',
        type: 'unit',
        items: targets,
      };

      const [unitId] = await System.prompt(stack, stack.processing.owner.id, choices);
      const unit = targets.find(card => card.id === unitId);
      if (!unit || !(unit instanceof Unit))
        throw new Error('正しいカードが選択されませんでした', unit);

      Effect.damage(stack, stack.processing, unit, unit.owner.field.length * 2000, 'effect');
    }
  },
};
