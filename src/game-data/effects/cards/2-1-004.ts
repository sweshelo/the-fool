import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  // 手札の赤属性ユニットのコストを-1する
  fieldEffect: (stack: StackWithCard<Unit>) => {
    PermanentEffect.mount(stack.processing, {
      targets: ['owns', 'hand'],
      effect: (target, source) => Effect.modifyCost(target, -1, { source }),
      condition: target =>
        target.catalog.color === Color.RED &&
        (target.catalog.type === 'advanced_unit' || target.catalog.type === 'unit') &&
        stack.processing.owner.id === stack.core.getTurnPlayer().id &&
        !EffectHelper.combo(stack.core, stack.processing, {
          action: 'drive',
          type: ['unit', 'advanced_unit'],
        }),
      effectCode: '甘い誘い',
    });
  },

  // ストロベリーファイア♪ - ユニット召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    // Find opponent units
    const targetsFilter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
    const isSelectable = EffectHelper.isUnitSelectable(
      stack.core,
      targetsFilter,
      stack.processing.owner
    );

    const damage = stack.processing.lv >= 2 ? 4000 : 1000;
    const strawberryFire = async () => {
      // Select target unit
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        targetsFilter,
        'ダメージを与えるユニットを選択して下さい'
      );

      // Deal damage
      Effect.damage(stack, stack.processing, target, damage);
    };

    await EffectHelper.combine(stack, [
      {
        title: 'ストロベリーファイア♪',
        description: `対戦相手のユニットに${damage}ダメージ`,
        effect: strawberryFire,
        condition: isSelectable,
      },
      { title: '甘い誘い', description: '手札の赤属性のコスト-1', effect: () => {} },
    ]);
  },
};
