import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkAttack: (stack: StackWithCard) => {
    return (
      stack.processing.owner.id !== stack.source.id &&
      !!stack.processing.owner.opponent.field.find(unit => unit.id === stack.target?.id)
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onAttack: async (stack: StackWithCard): Promise<void> => {
    const target = stack.processing.owner.opponent.field.find(unit => unit.id === stack.target?.id);
    if (!target) throw new Error('1-3-246: 対象のユニットが見つからない');

    switch (stack.processing.lv) {
      case 1: {
        await System.show(stack, '生命の矢', 'ユニットを破壊\n対戦相手のライフ+1');
        Effect.break(stack, stack.processing, target, 'effect');
        Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, 1);
        break;
      }
      case 2: {
        await System.show(stack, '生命の矢', 'ユニットを破壊');
        Effect.break(stack, stack.processing, target, 'effect');
        break;
      }
      case 3: {
        await System.show(stack, '生命の矢', 'ユニットを破壊\n自分のライフ+1');
        Effect.break(stack, stack.processing, target, 'effect');
        Effect.modifyLife(stack, stack.processing, stack.processing.owner, 1);
        break;
      }
    }
  },
};
