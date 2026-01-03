import { Card, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 召喚時に加護を付与し、選略効果を発動
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const [choice] =
      stack.processing.owner.hand.length > 0
        ? await System.prompt(stack, stack.processing.owner.id, {
            type: 'option',
            title: '選略・コズミックライトステージ',
            items: [
              { id: '1', description: 'ライフ+1' },
              { id: '2', description: '手札を1枚作成' },
            ],
          })
        : ['1'];

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
        if (target instanceof Card)
          stack.processing.owner.hand.push(target.clone(stack.processing.owner));
        break;
      }
    }
  },
};
