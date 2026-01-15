import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { StackWithCard } from '../schema/types';

export const effects = {
  checkDrive: (stack: StackWithCard): boolean => {
    return (
      stack.processing.owner.opponent.trash.length >= 3 &&
      stack.source.id !== stack.processing.owner.id
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '盗賊の手', '捨札を3枚選んで消滅\nカードを1枚引く');

    const targets = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      stack.processing.owner.opponent.trash,
      '消滅させるカードを選択して下さい',
      3
    );
    targets.forEach(card => Effect.move(stack, stack.processing, card, 'delete'));

    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
