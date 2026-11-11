import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  // 手札の紫属性ユニットのコストを-1する
  fieldEffect: (stack: StackWithCard<Unit>) => {
    PermanentEffect.mount(stack.processing, {
      targets: ['owns', 'hand'],
      effect: (target, source) => Effect.modifyCost(target, -1, { source }),
      condition: target =>
        target.catalog.color === Color.PURPLE &&
        (target.catalog.type === 'advanced_unit' || target.catalog.type === 'unit') &&
        stack.processing.owner.id === stack.core.getTurnPlayer().id &&
        !EffectHelper.combo(stack.core, stack.processing, {
          action: 'drive',
          type: ['unit', 'advanced_unit'],
        }),
      effectCode: '紫玉の飛沫',
    });
  },

  // グレープミスト♪ - ユニット召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;

    const amount = stack.processing.lv >= 2 ? 2 : 1;
    await System.show(
      stack,
      '紫玉の飛沫＆グレープミスト♪',
      `手札の紫属性のコスト-1\n紫ゲージ+${amount}`
    );
    await Effect.modifyPurple(stack, stack.processing, owner, amount);
  },
};
