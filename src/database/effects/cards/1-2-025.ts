import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // 幸運の風：自分のターン終了時、黄属性のユニットのレベルを-2する
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターン終了時のみ発動
    const isTurnPlayer = stack.processing.owner.id === stack.core.getTurnPlayer().id;

    if (isTurnPlayer) {
      const yellowUnits = stack.processing.owner.field.filter(
        unit => unit.catalog.color === Color.YELLOW
      );

      if (yellowUnits.length > 0) {
        await System.show(stack, '幸運の風', '黄属性ユニットのレベル-2');

        // 黄属性ユニットのレベルを-2
        yellowUnits.forEach(unit => {
          Effect.clock(stack, stack.processing, unit, -2);
        });
      }
    }
  },
};
