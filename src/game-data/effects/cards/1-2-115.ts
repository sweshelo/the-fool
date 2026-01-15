import { Card, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onHandes: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    // 対戦相手のハンデスに限る (手札を捨てたのが対戦相手で、その効果の発生源が自分である)
    // stack.target: 捨てた手札 / stack.source: 効果の発生源
    if (
      !(
        stack.processing instanceof Unit &&
        stack.target instanceof Card &&
        stack.source instanceof Card
      ) ||
      stack.target.owner.id === owner.id ||
      stack.target.owner.id === stack.source.owner.id
    )
      return;

    // 自身のレベルに応じて処理を分岐
    switch (stack.processing.lv) {
      case 3: {
        const opponent = stack.processing.owner.opponent;
        const filter = (unit: Unit) => opponent.field.includes(unit);

        const hasTargets = EffectHelper.isUnitSelectable(
          stack.core,
          filter,
          stack.processing.owner
        );

        await System.show(
          stack,
          'スリーピングホロウ',
          `${hasTargets ? '相手ユニットを1体選んで破壊\n' : ''}自身のレベル-2`
        );
        if (hasTargets) {
          const [unit] = await EffectHelper.pickUnit(
            stack,
            stack.processing.owner,
            filter,
            '破壊するユニットを選択'
          );
          if (unit) Effect.break(stack, stack.processing, unit, 'effect');
        }
        Effect.clock(stack, stack.processing, stack.processing, -2);
        break;
      }
      default: {
        await System.show(stack, 'スリーピングホロウ', '捨札から1枚回収');
        const [target] = EffectHelper.random(owner.trash);

        if (target) Effect.move(stack, stack.processing, target, 'hand');
        break;
      }
    }
  },
};
