import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■カウンター・クロック
  // あなたがプレイヤーアタックを受けるたび
  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    if (stack.target?.id === stack.processing.owner.id) {
      const filter = (unit: Unit) => unit.lv < 3;

      if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
        await System.show(stack, 'カウンター・クロック', 'レベル+1');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          'レベルを上げるユニットを選択'
        );
        Effect.clock(stack, stack.processing, target, 1);
      }
    }
  },

  // ■ダメージブレイク
  // このユニットがクロックアップするたび
  onClockupSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.opponent.id;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, 'ダメージブレイク', '5000ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        'ダメージを与えるユニットを選択'
      );
      Effect.damage(stack, stack.processing, target, 5000);
    }
  },
};
