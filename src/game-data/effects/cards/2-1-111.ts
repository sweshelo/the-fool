import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import { EffectTemplate } from '@/game-data/effects/engine/templates';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const [choice] =
      (await EffectHelper.choice(stack, stack.processing.owner, '選告・父の威厳', [
        {
          id: '1',
          description: '捨札から【機械】を2枚回収',
          condition: stack.processing.owner.trash.some(card =>
            card.catalog.species?.includes('機械')
          ),
        },
        { id: '2', description: 'デッキから3枚捨てる\nインターセプトカードを1枚引く' },
      ])) ?? [];

    switch (choice) {
      case '1': {
        await System.show(stack, '選告・父の威厳', '捨札から【機械】を2枚回収');
        EffectHelper.random(
          stack.processing.owner.trash.filter(card => card.catalog.species?.includes('機械')),
          2
        ).forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
        break;
      }
      case '2': {
        await System.show(
          stack,
          '選告・父の威厳',
          'デッキから3枚捨てる\nインターセプトカードを1枚引く'
        );
        EffectHelper.random(stack.processing.owner.deck, 3).forEach(card =>
          Effect.break(stack, stack.processing, card, 'effect')
        );
        EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
        break;
      }
    }
  },
};
