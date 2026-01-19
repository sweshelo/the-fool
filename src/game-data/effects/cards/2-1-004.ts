import { Unit, type Card } from '@/package/core/class/card';
import { Effect, EffectHelper, PermanentEffect, System, type DeltaSourceOption } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  // 手札の赤属性ユニットのコストを-1する
  fieldEffect: (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;

    // Check if player is the turn player
    if (owner.id !== stack.core.getTurnPlayer().id) return;

    // Check if no units have been summoned this turn by checking histories
    const hasNotSummonedUnits = !stack.core.histories.some(
      history => history.action === 'drive' && history.card.owner.id === owner.id
    );

    // 手札の赤属性ユニットのコストを-1
    PermanentEffect.mount(stack, stack.processing, {
      targets: ['owns', 'hand'],
      effect: (card: Card, option: DeltaSourceOption) => {
        if (card instanceof Unit) {
          card.delta.push(new Delta({ type: 'cost', value: -1 }, option));
        }
      },
      condition: (card: Card) =>
        card.catalog.color === Color.RED && card instanceof Unit && hasNotSummonedUnits,
      effectCode: '甘い誘い',
    });
  },

  // ストロベリーファイア♪ - ユニット召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    // Find opponent units
    const targetsFilter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
    const targets_selectable = EffectHelper.isUnitSelectable(
      stack.core,
      targetsFilter,
      stack.processing.owner
    );

    if (targets_selectable) {
      const damage = stack.processing.lv >= 2 ? 4000 : 1000;
      await System.show(stack, 'ストロベリーファイア♪', `対戦相手のユニットに${damage}ダメージ`);

      // Select target unit
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        targetsFilter,
        'ダメージを与えるユニットを選択して下さい'
      );

      // Deal damage
      Effect.damage(stack, stack.processing, target, damage);
    } else {
      await System.show(stack, '甘い誘い', '手札の赤属性のコスト-1');
    }
  },
};
