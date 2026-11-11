import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Card, Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const filter = (card: Card): card is Unit =>
      card.catalog.type === 'unit' &&
      card.catalog.cost <= 3 &&
      (card.catalog.species?.includes('魔導士') ?? false);
    const [choice] =
      (await EffectHelper.choice(stack, stack.processing.owner, '選略・魔導式傀儡術', [
        {
          id: '1',
          description: '【魔導士】を【特殊召喚】',
          condition: stack.processing.owner.trash.some(filter),
        },
        { id: '2', description: '自身のレベル+2' },
      ])) ?? [];

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・魔導式傀儡術', '【魔導士】を【特殊召喚】');
        await Promise.all(
          EffectHelper.random(stack.processing.owner.trash.filter(filter)).map(unit =>
            Effect.summon(stack, stack.processing, unit)
          )
        );
        break;
      }
      case '2': {
        await System.show(stack, '選略・魔導式傀儡術', '自身のレベル+2');
        Effect.clock(stack, stack.processing, stack.processing, 2);
        break;
      }
    }
  },
  onTurnEnd: async (stack: StackWithCard) => {
    const [target] = EffectHelper.random(stack.processing.owner.field.filter(unit => unit.lv <= 2));
    if (stack.processing.owner.id !== stack.source.id || !target) return;

    await System.show(stack, 'クロック・ブースト', 'レベル+2');
    Effect.clock(stack, stack.processing, target, 2);
  },
};
