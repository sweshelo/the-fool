import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit, type Card } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const filter = (card: Card): card is Unit =>
      card instanceof Unit && card.catalog.type === 'unit' && card.catalog.cost <= 3;
    const targets = stack.processing.owner.hand.filter(filter);
    if (stack.processing.owner.field.length > 4 || targets.length === 0) return;

    await System.show(stack, '鬱々たる蠱術', '手札を選んで捨てる\n【特殊召喚】');
    const [target] = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      targets,
      '捨てるカードを選んで下さい'
    );
    Effect.break(stack, stack.processing, target, 'effect');

    await Promise.all(
      EffectHelper.random(stack.processing.owner.trash.filter(filter)).map(unit =>
        Effect.summon(stack, stack.processing, unit)
      )
    );
  },
};
