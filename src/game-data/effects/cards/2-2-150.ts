import { Effect, EffectHelper, System } from '@/game-data/effects';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkTurnEnd: (stack: StackWithCard) => stack.source.id === stack.processing.owner.id,
  onTurnEnd: async (stack: StackWithCard) => {
    const choice = await EffectHelper.choice(
      stack,
      stack.processing.owner,
      '選略・ウロボロスの刻印',
      [
        { id: '1', description: '紫ゲージ+2' },
        {
          id: '2',
          description: '捨札から2枚回収\n紫ゲージ-1',
          condition: (stack.processing.owner.purple ?? 0) >= 1,
        },
      ]
    );

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・ウロボロスの刻印', '紫ゲージ+2');
        await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 2);
        break;
      }
      case '2': {
        await System.show(stack, '選略・ウロボロスの刻印', '捨札から2枚回収\n紫ゲージ-1');
        EffectHelper.random(stack.processing.owner.trash, 2).forEach(card => {
          Effect.move(stack, stack.processing, card, 'hand');
        });
        await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, -1);
        break;
      }
    }
  },
};
