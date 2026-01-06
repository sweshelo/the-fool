import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
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

    // Apply or remove cost reduction to red units in hand
    owner.hand.forEach(card => {
      if (card.catalog.color === Color.RED && card instanceof Unit) {
        // Find delta from this card
        const delta = card.delta.find(d => d.source?.unit === stack.processing.id);

        if (delta && delta.effect.type === 'cost') {
          if (!hasNotSummonedUnits) {
            // Remove delta if condition is no longer met
            card.delta = card.delta.filter(d => !(d.source?.unit === stack.processing.id));
          }
        } else if (hasNotSummonedUnits) {
          // Add delta if condition is met
          card.delta.push(
            new Delta(
              { type: 'cost', value: -1 },
              {
                source: {
                  unit: stack.processing.id,
                },
              }
            )
          );
        }
      }
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
