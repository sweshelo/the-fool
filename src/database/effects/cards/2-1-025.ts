import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  // 手札の紫属性ユニットのコストを-1する
  fieldEffect: (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;

    // Check if player is the turn player
    if (owner.id !== stack.core.getTurnPlayer().id) return;

    // Check if no units have been summoned this turn by checking histories
    const hasNotSummonedUnits = !stack.core.histories.some(
      history => history.action === 'drive' && history.card.owner.id === owner.id
    );

    // Apply or remove cost reduction to purple units in hand
    owner.hand.forEach(card => {
      if (card.catalog.color === Color.PURPLE && card instanceof Unit) {
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

  // グレープミスト♪ - ユニット召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const purpleGauge = owner.purple;

    if (purpleGauge) {
      const amount = stack.processing.lv >= 2 ? 2 : 1;
      await System.show(stack, 'グレープミスト♪', `紫ゲージ+${amount}`);
      await Effect.modifyPurple(stack, stack.processing, owner, amount);
    } else {
      await System.show(stack, '紫玉の飛沫', '手札の紫属性のコスト-1');
    }
  },
};
