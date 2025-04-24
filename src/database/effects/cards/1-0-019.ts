import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const owner = EffectHelper.owner(stack.core, stack.processing);
    const opponent = EffectHelper.opponent(stack.core, stack.processing);
    const isOnField = opponent.field.length > 0;

    if (isOnField) {
      await System.show(stack, 'ジャンプーダンス', '手札に戻す');
      const [choice] = await System.prompt(stack, owner.id, {
        title: '手札に戻すユニットを選択',
        type: 'unit',
        items: opponent.field,
      });

      const target = opponent.field.find(unit => unit.id === choice) ?? opponent.field[0];
      if (!target) throw new Error('対戦相手のフィールドにユニットが存在しません');

      Effect.bounce(stack, stack.processing, target, 'hand');
    }
  },
};
