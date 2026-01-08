import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 選略効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const choice = await EffectHelper.choice(
      stack,
      stack.processing.owner,
      '選略・まじかるツヴァイ',
      [
        {
          id: '1',
          description: 'デッキから【魔導士】ユニットを【特殊召喚】',
          condition: () =>
            stack.processing.owner.field.length < stack.core.room.rule.player.max.field,
        },
        {
          id: '2',
          description: '敵全体の基本BP-［【魔導士】×1000］',
          condition: () => stack.processing.owner.opponent.field.length > 0,
        },
      ]
    );

    switch (choice) {
      case '1':
        const deck = stack.processing.owner.deck.filter(
          card =>
            card.catalog.cost <= 3 &&
            card.catalog.species?.includes('魔導士') &&
            card.catalog.type === 'unit'
        ) as Unit[];
        if (deck.length > 0) {
          const [randomCard] = EffectHelper.random(deck, 1);
          await System.show(
            stack,
            '選略・まじかるツヴァイ',
            'デッキから【魔導士】ユニットを【特殊召喚】'
          );
          if (randomCard) await Effect.summon(stack, stack.processing, randomCard);
        }
        break;
      case '2':
        const damage =
          stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('魔導士'))
            .length * 1000;
        await System.show(stack, '選略・まじかるツヴァイ', `敵全体の基本BP-［【魔導士】×1000］`);
        stack.processing.owner.opponent.field.forEach(unit => {
          Effect.modifyBP(stack, stack.processing, unit, -damage, { isBaseBP: true });
        });
        break;
    }
  },
};
