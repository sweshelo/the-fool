import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.processing instanceof Unit)) throw new Error('不正なタイプが指定されました');

    if (stack.processing.owner.field.length <= 4) {
      await System.show(stack, '冥界ランデブー', 'ユニットを【複製】し破壊');

      const targetsFilter = (unit: Unit) => unit.owner.id === stack.processing.owner.id;
      const targets_selectable = EffectHelper.isUnitSelectable(
        stack.core,
        targetsFilter,
        stack.processing.owner
      );
      const choices: Choices = {
        title: '【複製】し破壊するユニットを選択してください',
        type: 'unit',
        items: targets,
      };

      const [unitId] = await System.prompt(stack, stack.processing.owner.id, choices);
      const unit = targets.find(card => card.id === unitId);
      if (!unit || !(unit instanceof Unit))
        throw new Error('正しいカードが選択されませんでした', unit);

      await Effect.clone(stack, stack.processing, unit, stack.processing.owner);
      Effect.break(stack, stack.processing, unit, 'effect');
    }
  },

  onTurnStartInTrash: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.processing instanceof Unit))
      throw new Error('Unitではないオブジェクトが指定されました');

    if (stack.processing.owner.field.length === 0) {
      await System.show(stack, '蘇る爛漫少女', '【特殊召喚】');
      await Effect.summon(stack, stack.processing, stack.processing);
    }
  },
};
