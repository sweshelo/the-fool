import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  // 手札の青属性ユニットのコストを-1する
  fieldEffect: (stack: StackWithCard<Unit>) => {
    PermanentEffect.mount(stack.processing, {
      targets: ['owns', 'hand'],
      effect: (target, source) => Effect.modifyCost(target, -1, { source }),
      condition: target =>
        target.catalog.color === Color.BLUE &&
        (target.catalog.type === 'advanced_unit' || target.catalog.type === 'unit') &&
        stack.processing.owner.id === stack.core.getTurnPlayer().id &&
        !EffectHelper.combo(stack.core, stack.processing, {
          action: 'drive',
          type: ['unit', 'advanced_unit'],
        }),
      effectCode: '視界良好',
    });
  },

  // ブルベリフリーズ♪ - ユニット召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    // Get level-dependent target level (Lv1: target Lv3+, Lv2+: target Lv2+)
    const targetLevel = stack.processing.lv >= 2 ? 2 : 3;

    // Find opponent units of required level
    const targetsFilter = (unit: Unit) =>
      unit.owner.id !== stack.processing.owner.id && unit.lv >= targetLevel;
    const targets_selectable = EffectHelper.isUnitSelectable(
      stack.core,
      targetsFilter,
      stack.processing.owner
    );

    if (targets_selectable) {
      await System.show(
        stack,
        '視界良好＆ブルベリフリーズ♪',
        `手札の青属性のコスト-1\nレベル${targetLevel}以上のユニットを破壊`
      );

      // Select target unit
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        targetsFilter,
        `破壊するレベル${targetLevel}以上のユニットを選択`
      );

      // Destroy it
      Effect.break(stack, stack.processing, target);
    } else {
      await System.show(stack, '視界良好', '手札の青属性のコスト-1');
    }
  },
};
