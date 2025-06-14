import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  // 手札の黄属性ユニットのコストを-1する
  fieldEffect: (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;

    // Check if player is the turn player
    if (owner.id !== stack.core.getTurnPlayer().id) return;

    // Check if no units have been summoned this turn by checking histories
    const hasNotSummonedUnits = !stack.core.histories.some(
      history => history.action === 'drive' && history.card.owner.id === owner.id
    );

    // Apply or remove cost reduction to yellow units in hand
    owner.hand.forEach(card => {
      if (card.catalog.color === Color.YELLOW && card instanceof Unit) {
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

  // ビタミン供給 - ユニット召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    // Find opponent units of required level
    const targets = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );

    if (targets.length > 0) {
      await System.show(
        stack,
        'ビタミン供給＆レモンフラッシュ♪',
        `手札の黄属性のコスト-1\n行動権を消費`
      );

      // Select target unit
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        targets,
        `行動権を消費するユニットを選択して下さい`,
        stack.processing.lv >= 2 ? 2 : 1
      );

      // Destroy it
      Effect.break(stack, stack.processing, target);
    } else {
      await System.show(stack, 'ビタミン供給', '手札の黄属性のコスト-1');
    }
  },
};
