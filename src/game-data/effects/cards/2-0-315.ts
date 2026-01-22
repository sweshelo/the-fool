import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    const [choice] =
      opponent.hand.length === 0
        ? ['2']
        : await System.prompt(stack, owner.id, {
            type: 'option',
            title: '選略・呪詛発生装置',
            items: [
              { id: '1', description: '手札を1枚破壊' },
              { id: '2', description: '【珍獣】ユニットを1枚引く' },
            ],
          });

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・呪詛発生装置', '手札を1枚破壊');
        const [target] = EffectHelper.random(opponent.hand, 1);
        if (target) Effect.break(stack, stack.processing, target);
        break;
      }

      case '2': {
        await System.show(stack, '選略・呪詛発生装置', '【珍獣】ユニットを1枚引く');
        EffectTemplate.reinforcements(stack, owner, { species: '珍獣' });
        break;
      }
    }
  },
};
