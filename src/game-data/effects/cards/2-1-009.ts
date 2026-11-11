import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  // 手札の黄属性ユニットのコストを-1する
  fieldEffect: (stack: StackWithCard<Unit>) => {
    PermanentEffect.mount(stack.processing, {
      targets: ['owns', 'hand'],
      effect: (target, source) => Effect.modifyCost(target, -1, { source }),
      condition: target =>
        target.catalog.color === Color.YELLOW &&
        (target.catalog.type === 'advanced_unit' || target.catalog.type === 'unit') &&
        stack.processing.owner.id === stack.core.getTurnPlayer().id &&
        !EffectHelper.combo(stack.core, stack.processing, {
          action: 'drive',
          type: ['unit', 'advanced_unit'],
        }),
      effectCode: 'ビタミン供給',
    });
  },

  // ビタミン供給 - ユニット召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    // Find opponent units of required level
    const targetsFilter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
    const targets_selectable = EffectHelper.isUnitSelectable(
      stack.core,
      targetsFilter,
      stack.processing.owner
    );

    if (targets_selectable) {
      await System.show(
        stack,
        'ビタミン供給＆レモンフラッシュ♪',
        `手札の黄属性のコスト-1\n行動権を消費`
      );

      // Select target unit
      const targets = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        targetsFilter,
        `行動権を消費するユニットを選択して下さい`,
        stack.processing.lv >= 2 ? 2 : 1
      );

      targets.forEach(target => {
        Effect.activate(stack, stack.processing, target, false);
      });
    } else {
      await System.show(stack, 'ビタミン供給', '手札の黄属性のコスト-1');
    }
  },
};
