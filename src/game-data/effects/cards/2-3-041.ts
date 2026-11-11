import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Card, Unit } from '@/package/core/class/card';

const filter = (card: Card): card is Unit =>
  card.catalog.type === 'unit' &&
  (card.catalog.species?.includes('忍者') ?? false) &&
  card.catalog.cost <= 3;

export const effects: CardEffects = {
  checkDrive: stack =>
    stack.processing.owner.field.length < stack.core.room.rule.player.max.field &&
    stack.target instanceof Unit &&
    stack.target.catalog.species?.includes('忍者') &&
    stack.processing.owner.trash.some(filter),
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '隠密達の決起会', '捨札から【忍者】を【特殊召喚】');
    for (const unit of EffectHelper.random(stack.processing.owner.trash.filter(filter), 2)) {
      await Effect.summon(stack, stack.processing, unit);
    }
  },
};
