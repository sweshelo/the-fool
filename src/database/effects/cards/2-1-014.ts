import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  // 視界良好 - フィールド効果として実装し、歴史に青属性ユニットの召喚履歴が存在しないターン間
  // 手札の青属性ユニットのコストを-1する
  fieldEffect: (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;

    // Check if player is the turn player
    if (owner.id !== stack.core.getTurnPlayer().id) return;

    // Check if no units have been summoned this turn by checking histories
    const hasNotSummonedUnits = !stack.core.histories.some(
      history => history.action === 'drive' && history.card.owner.id === owner.id
    );

    // Apply or remove cost reduction to blue units in hand
    owner.hand.forEach(card => {
      if (card.catalog.color === Color.BLUE && card instanceof Unit) {
        // Find delta from this card
        const delta = card.delta.find(
          d => d.source?.unit === stack.processing.id && d.source?.effectCode === '視界良好'
        );

        if (delta && delta.effect.type === 'cost') {
          if (!hasNotSummonedUnits) {
            // Remove delta if condition is no longer met
            card.delta = card.delta.filter(
              d => !(d.source?.unit === stack.processing.id && d.source?.effectCode === '視界良好')
            );
          }
        } else if (hasNotSummonedUnits) {
          // Add delta if condition is met
          card.delta.push(
            new Delta({ type: 'cost', value: -1 }, undefined, undefined, undefined, {
              unit: stack.processing.id,
              effectCode: '視界良好',
            })
          );
        }
      }
    });
  },

  // ブルベリフリーズ♪ - ユニット召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    // Get level-dependent target level (Lv1: target Lv3+, Lv2+: target Lv2+)
    const targetLevel = stack.processing.lv >= 2 ? 2 : 3;

    // Find opponent units of required level
    const targets = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id && unit.lv >= targetLevel,
      stack.processing.owner
    );

    if (targets.length > 0) {
      await System.show(stack, 'ブルベリフリーズ♪', `レベル${targetLevel}以上のユニットを破壊`);

      // Select target unit
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        targets,
        `破壊するレベル${targetLevel}以上のユニットを選択`
      );

      // Destroy it
      Effect.break(stack, stack.processing, target);
    }
  },
};
