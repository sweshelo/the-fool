import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 選略効果を発動
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const choice = await EffectHelper.choice(
      stack,
      stack.processing.owner,
      '選略・コズミックライトステージ',
      [
        { id: '1', description: 'ライフ+1' },
        {
          id: '2',
          description: '手札を1枚作成',
          condition: () =>
            stack.processing.owner.hand.length > 0 &&
            stack.processing.owner.hand.length < stack.core.room.rule.player.max.hand,
        },
      ]
    );

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・コズミックライトステージ', 'ライフ+1');
        Effect.modifyLife(stack, stack.processing, stack.processing.owner, 1);
        break;
      }

      case '2': {
        await System.show(stack, '選略・コズミックライトステージ', '手札を1枚作成');

        const [target] = await EffectHelper.selectCard(
          stack,
          stack.processing.owner,
          stack.processing.owner.hand,
          '作成するカードを選択して下さい',
          1
        );

        Effect.make(stack, stack.processing.owner, target);
        break;
      }
    }
  },
};
