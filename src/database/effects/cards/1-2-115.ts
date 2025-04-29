import { Card, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onHandes: async (stack: StackWithCard): Promise<void> => {
    const owner = EffectHelper.owner(stack.core, stack.processing);

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
        const opponent = stack.processing.owner;
        const candidate = EffectHelper.candidate(stack.core, (unit: Unit) =>
          opponent.field.includes(unit)
        );

        await System.show(
          stack,
          'スリーピングホロウ',
          `${candidate.length > 0 ? '相手ユニットを1体選んで破壊\n' : ''}自身のレベル-2`
        );
        if (candidate.length > 0) {
          const [unitId] = await System.prompt(
            stack,
            EffectHelper.owner(stack.core, stack.processing).id,
            {
              type: 'unit',
              title: '破壊するユニットを選択',
              items: candidate,
            }
          );
          const unit = candidate.find(unit => unit.id === unitId);
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
