import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたがプレイヤーアタックを受けるたび
  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    if (stack.target?.id === owner.id) {
      const filter = (unit: Unit) => unit.lv < 3;

      if (EffectHelper.isUnitSelectable(stack.core, filter, owner)) {
        await System.show(stack, 'カウンター・クロック', 'レベル+1');
        const [target] = await EffectHelper.pickUnit(
          stack,
          owner,
          filter,
          'レベルを上げるユニットを選択'
        );
        Effect.clock(stack, stack.processing, target, 1);
      }
    }
  },

  // このユニットがクロックアップするたび
  onClockupSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    const filter = (unit: Unit) => unit.owner.id === opponent.id;

    if (EffectHelper.isUnitSelectable(stack.core, filter, owner)) {
      await System.show(stack, 'さいれんとたいむ', '【沈黙】を付与');
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        filter,
        '【沈黙】を付与するユニットを選択'
      );
      Effect.keyword(stack, stack.processing, target, '沈黙');
    }
  },
};
