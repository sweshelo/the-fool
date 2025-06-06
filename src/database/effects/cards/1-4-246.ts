import { Card, Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { Choices } from '@/submodule/suit/types/game/system';
import type { StackWithCard } from '../classes/types';

export const effects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard): boolean => {
    if (!(stack.target instanceof Card)) return false;

    const isOpponentUnit = stack.target.owner.id !== stack.processing.owner.id;
    const onField =
      stack.processing.owner.opponent.field.find(unit => unit.id === stack.target?.id) ?? false;
    const hasHand = stack.processing.owner.hand.length > 0;
    return isOpponentUnit && onField && hasHand;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    await System.show(
      stack,
      'デストラクションスピア',
      '手札を1枚選んで捨てる\nユニットを破壊\n1ライフダメージ'
    );
    const choices: Choices = {
      title: '捨てるカードを選択してください',
      type: 'card',
      items: owner.hand,
      count: 1,
    };

    const [response] = await System.prompt(stack, owner.id, choices);
    Effect.break(stack, stack.processing, stack.target as Unit);
    const target = owner.hand.find(card => card.id === response);
    if (!target) throw new Error('正しいカードが選択されませんでした');
    Effect.handes(stack, stack.processing, target);
    stack.processing.owner.damage(true);
  },
};
